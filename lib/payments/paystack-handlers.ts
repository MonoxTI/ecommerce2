// lib/payments/paystack-handlers.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, badRequest, unauthorized, notFound } from "@/lib/api/response";
import { initializePaystackTransaction, verifyPaystackTransaction, verifyPaystackWebhook } from "@/lib/payments/paystack";
import { sendOrderConfirmedEmail } from "@/lib/emails/mailer";

export async function handleInitiatePaystackPayment(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body?.orderId) return badRequest("orderId is required");
  const order = await db.order.findFirst({
    where: { id: body.orderId, userId: user.sub },
    include: { payment: true, user: { select: { name: true, email: true } } },
  });
  if (!order) return notFound("Order not found");
  if (order.payment?.status === "SUCCESS") return badRequest("This order has already been paid");
  if (order.status === "CANCELLED") return badRequest("This order has been cancelled");
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl}/checkout/success?orderId=${order.id}`;
  const { authorizationUrl, accessCode, reference } = await initializePaystackTransaction({
    orderId: order.id, amountCents: Number(order.total), email: order.user.email, callbackUrl,
  });
  await db.payment.upsert({
    where: { orderId: order.id },
    update: { transactionId: reference, provider: "paystack" },
    create: { orderId: order.id, provider: "paystack", transactionId: reference, status: "PENDING", amount: order.total },
  });
  return ok({ authorizationUrl, accessCode, reference });
}

export async function handleVerifyPaystackPayment(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body?.reference) return badRequest("reference is required");
  const tx = await verifyPaystackTransaction(body.reference);
  if (tx.status !== "success") return badRequest(`Payment ${tx.status}. Please try again.`);
  const payment = await db.payment.findFirst({
    where: { transactionId: body.reference },
    include: { order: { include: { items: true } } },
  });
  if (!payment) return badRequest("Order not found for this transaction");
  if (payment.status === "SUCCESS") return ok({ orderId: payment.orderId }, "Already processed");
  if (tx.amount !== Number(payment.order.total)) {
    console.error(`[Paystack Verify] Amount mismatch`);
    return badRequest("Payment amount does not match order total");
  }
  await db.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } });
  await db.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
  sendOrderConfirmedEmail(await buildOrderEmailParams(payment.orderId)).catch(console.error);
  console.log(`[Paystack Verify] Order ${payment.orderId} marked as PAID`);
  return ok({ orderId: payment.orderId }, "Payment verified successfully");
}

export async function handlePaystackWebhook(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  if (!verifyPaystackWebhook(rawBody, signature)) return new Response("Invalid signature", { status: 400 });
  let event: any;
  try { event = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }
  console.log(`[Paystack Webhook] Event: ${event.event}`);
  try {
    if (event.event === "charge.success") await processSuccess(event.data);
    else if (event.event === "charge.failed") await processFailure(event.data);
  } catch (err) { console.error(`[Paystack Webhook] Error:`, err); }
  return new Response("OK", { status: 200 });
}

async function processSuccess(data: any) {
  const orderId = data.metadata?.orderId;
  const reference = data.reference;
  const amount = data.amount;
  if (!orderId) { console.error("[Paystack Webhook] No orderId in metadata"); return; }
  const order = await db.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order) { console.error(`Order not found: ${orderId}`); return; }
  if (order.payment?.status === "SUCCESS") { console.log(`Already paid: ${orderId}`); return; }
  if (amount !== Number(order.total)) { console.error(`Amount mismatch: ${orderId}`); return; }
  await db.payment.updateMany({ where: { orderId, status: { not: "SUCCESS" } }, data: { status: "SUCCESS", transactionId: reference } });
  await db.order.update({ where: { id: orderId }, data: { status: "PAID" } });
  sendOrderConfirmedEmail(await buildOrderEmailParams(orderId)).catch(console.error);
  console.log(`[Paystack Webhook] Order ${orderId} marked as PAID`);
}

async function processFailure(data: any) {
  const orderId = data.metadata?.orderId;
  if (!orderId) return;
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;
  await db.payment.updateMany({ where: { orderId }, data: { status: "FAILED" } });
  await db.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
    }
  });
  console.log(`[Paystack Webhook] Payment failed for order ${orderId}`);
}

async function buildOrderEmailParams(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      items: { include: { variant: { include: { product: { select: { name: true } } } } } },
    },
  });
  if (!order) throw new Error(`Order ${orderId} not found for email`);
  const shipping = Number(order.total) >= 100000 ? 0 : 9900;
  return {
    to: order.user.email,
    customerName: order.user.name,
    orderId: order.id,
    orderDate: new Date(order.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }),
    items: order.items.map(item => ({
      name: item.variant.product.name,
      variant: [item.variant.color, item.variant.length ? `${item.variant.length}"` : null, item.variant.laceType].filter(Boolean).join(" · ") || "Standard",
      quantity: item.quantity,
      price: Number(item.price),
    })),
    subtotal: Number(order.total) - shipping,
    shipping,
    total: Number(order.total),
    address: order.address ? {
      fullName: order.address.fullName, street: order.address.street,
      city: order.address.city, province: order.address.province,
      postalCode: order.address.postalCode, country: order.address.country,
    } : { fullName: "", street: "", city: "", province: "", postalCode: "", country: "South Africa" },
  };
}