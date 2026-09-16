// app/api/payments/yoco-webhook/route.ts
// Yoco sends webhook events after payments
// Must return 200 always

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { verifyYocoWebhook, YOCO_CONFIG } from "@/lib/payments/yoco";
import { sendOrderConfirmedEmail } from "@/lib/emails/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const signature = req.headers.get("x-yoco-signature") ?? "";

  // Verify signature if webhook secret is configured
  if (YOCO_CONFIG.webhookSecret) {
    if (!verifyYocoWebhook(rawBody, signature, YOCO_CONFIG.webhookSecret)) {
      console.error("[Yoco Webhook] Invalid signature");
      return new Response("Invalid signature", { status: 400 });
    }
  }

  let event: any;
  try { event = JSON.parse(rawBody); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  console.log(`[Yoco Webhook] Event: ${event.type}`);

  try {
    if (event.type === "payment.succeeded") {
      await processSuccess(event.payload);
    } else if (event.type === "payment.failed") {
      await processFailure(event.payload);
    }
  } catch (err) {
    console.error("[Yoco Webhook] Error:", err);
  }

  return new Response("OK", { status: 200 });
}

async function processSuccess(payload: any) {
  const checkoutId = payload.metadata?.checkoutId ?? payload.checkoutId;
  const orderId    = payload.metadata?.orderId;

  if (!orderId && !checkoutId) {
    console.error("[Yoco Webhook] No orderId or checkoutId in payload");
    return;
  }

  // Find payment by orderId in metadata or by transactionId (checkoutId)
  const payment = await db.payment.findFirst({
    where: {
      OR: [
        { orderId:       orderId ?? "" },
        { transactionId: checkoutId ?? "" },
      ],
      provider: "yoco",
    },
    include: { order: true },
  });

  if (!payment) { console.error("[Yoco Webhook] Payment not found"); return; }
  if (payment.status === "SUCCESS") { console.log("[Yoco Webhook] Already processed"); return; }

  const amountCents = payload.amount ?? payload.amountInCents;
  if (amountCents && amountCents !== Number(payment.order.total)) {
    console.error(`[Yoco Webhook] Amount mismatch: expected ${payment.order.total}, got ${amountCents}`);
    return;
  }

  await db.payment.update({
    where: { id: payment.id },
    data:  { status: "SUCCESS", transactionId: payload.id ?? checkoutId },
  });
  await db.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });

  buildOrderEmailParams(payment.orderId)
    .then(p => sendOrderConfirmedEmail(p))
    .catch(console.error);

  console.log(`[Yoco Webhook] ✅ Order ${payment.orderId} marked as PAID`);
}

async function processFailure(payload: any) {
  const checkoutId = payload.metadata?.checkoutId ?? payload.checkoutId;
  const payment = await db.payment.findFirst({
    where: { transactionId: checkoutId, provider: "yoco" },
  });
  if (!payment) return;
  await db.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
  console.log(`[Yoco Webhook] ❌ Payment failed for order ${payment.orderId}`);
}

async function buildOrderEmailParams(orderId: string) {
  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: {
      user:    { select: { name: true, email: true } },
      address: true,
      items:   { include: { variant: { include: { product: { select: { name: true } } } } } },
    },
  });
  if (!order) throw new Error(`Order ${orderId} not found`);
  return {
    to:           order.user.email,
    customerName: order.user.name,
    orderId:      order.id,
    orderDate:    new Date(order.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }),
    items: order.items.map(item => ({
      name:     item.variant.product.name,
      variant:  [item.variant.color, item.variant.length ? `${item.variant.length}"` : null].filter(Boolean).join(" · ") || "Standard",
      quantity: item.quantity,
      price:    Number(item.price),
    })),
    subtotal: Number(order.total),
    shipping: 0,
    total:    Number(order.total),
    address: order.address ? {
      fullName: order.address.fullName, street: order.address.street,
      city: order.address.city, province: order.address.province,
      postalCode: order.address.postalCode, country: order.address.country,
    } : { fullName: "", street: "", city: "", province: "", postalCode: "", country: "South Africa" },
  };
}