// lib/payments/handlers.ts
// PayFast payment handlers for novaa

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, badRequest, unauthorized, notFound } from "@/lib/api/response";
import {
  buildPayFastData,
  verifyPayFastSignature,
  verifyPayFastPayment,
  PAYFAST_CONFIG,
} from "@/lib/payments/payfast";

// ─── INITIATE PAYFAST PAYMENT ─────────────────────────────────
// POST /api/payments/payfast

export async function handleInitiatePayFast(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.orderId) return badRequest("orderId is required");

  const order = await db.order.findFirst({
    where:   { id: body.orderId, userId: user.sub },
    include: {
      payment: true,
      user:    { select: { name: true, email: true } },
      items:   {
        include: { variant: { include: { product: { select: { name: true } } } } },
        take: 1,
      },
    },
  });

  if (!order)                              return notFound("Order not found");
  if (order.payment?.status === "SUCCESS") return badRequest("This order has already been paid");
  if (order.status === "CANCELLED")        return badRequest("This order has been cancelled");

  const nameParts = (order.user.name ?? "Customer").split(" ");
  const firstName = nameParts[0];
  const lastName  = nameParts.slice(1).join(" ") || firstName;
  const itemName  = order.items[0]?.variant?.product?.name
    ? `novaa — ${order.items[0].variant.product.name}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`
    : "novaa Hair Products";

  const { actionUrl, fields } = buildPayFastData({
    orderId:     order.id,
    amountCents: Number(order.total),
    email:       order.user.email,
    firstName,
    lastName,
    itemName,
  });

  // Store pending payment record
  await db.payment.upsert({
    where:  { orderId: order.id },
    update: { transactionId: order.id, provider: "payfast" },
    create: {
      orderId:       order.id,
      provider:      "payfast",
      transactionId: order.id,
      status:        "PENDING",
      amount:        order.total,
    },
  });

  return ok({ actionUrl, fields });
}

// ─── PAYFAST ITN WEBHOOK ─────────────────────────────────────
// POST /api/payments/payfast-notify
// Called by PayFast server-to-server after every payment.
// Must return 200 always.

export async function handlePayFastITN(req: NextRequest) {
  const text   = await req.text();
  const params = Object.fromEntries(new URLSearchParams(text));

  console.log("[PayFast ITN] Received:", params.payment_status, "for order:", params.m_payment_id);

  // Verify signature
  if (!verifyPayFastSignature(params, PAYFAST_CONFIG.passphrase)) {
    console.error("[PayFast ITN] Invalid signature");
    return new Response("Invalid signature", { status: 400 });
  }

  // Verify with PayFast server
  const isValid = await verifyPayFastPayment(params);
  if (!isValid) {
    console.error("[PayFast ITN] Payment validation failed");
    return new Response("Validation failed", { status: 400 });
  }

  const orderId       = params.m_payment_id ?? params.custom_str1;
  const paymentStatus = params.payment_status;
  const amountCents   = Math.round(parseFloat(params.amount_gross ?? "0") * 100);

  if (!orderId) {
    console.error("[PayFast ITN] No orderId in params");
    return new Response("OK", { status: 200 });
  }

  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: { payment: true },
  });

  if (!order) {
    console.error(`[PayFast ITN] Order not found: ${orderId}`);
    return new Response("OK", { status: 200 });
  }

  if (paymentStatus === "COMPLETE") {
    if (order.payment?.status === "SUCCESS") {
      console.log(`[PayFast ITN] Already paid: ${orderId}`);
      return new Response("OK", { status: 200 });
    }

    if (amountCents !== Number(order.total)) {
      console.error(`[PayFast ITN] Amount mismatch for ${orderId}: expected ${order.total}, got ${amountCents}`);
      return new Response("OK", { status: 200 });
    }

    await db.payment.updateMany({
      where: { orderId, status: { not: "SUCCESS" } },
      data:  { status: "SUCCESS", transactionId: params.pf_payment_id ?? orderId },
    });
    await db.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    console.log(`[PayFast ITN] ✅ Order ${orderId} marked as PAID`);

  } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
    await db.payment.updateMany({ where: { orderId }, data: { status: "FAILED" } });
    console.log(`[PayFast ITN] ❌ Payment ${paymentStatus} for order ${orderId}`);
  }

  return new Response("OK", { status: 200 });
}