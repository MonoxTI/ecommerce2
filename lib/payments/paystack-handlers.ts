// lib/payments/paystack-handlers.ts

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, badRequest, unauthorized, notFound } from "@/lib/api/response";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  verifyPaystackWebhook,
} from "@/lib/payments/paystack";

// ─── INITIATE ────────────────────────────────────────────────
// POST /api/payments/initiate

export async function handleInitiatePaystackPayment(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.orderId) return badRequest("orderId is required");

  const order = await db.order.findFirst({
    where:   { id: body.orderId, userId: user.sub },
    include: { payment: true, user: { select: { name: true, email: true } } },
  });

  if (!order)                              return notFound("Order not found");
  if (order.payment?.status === "SUCCESS") return badRequest("This order has already been paid");
  if (order.status === "CANCELLED")        return badRequest("This order has been cancelled");

  const appUrl      = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl}/checkout/success?orderId=${order.id}`;

  const { authorizationUrl, accessCode, reference } = await initializePaystackTransaction({
    orderId:     order.id,
    amountCents: Number(order.total),
    email:       order.user.email,
    callbackUrl,
  });

  // Store reference for verification later
  await db.payment.upsert({
    where:  { orderId: order.id },
    update: { transactionId: reference, provider: "paystack" },
    create: {
      orderId:       order.id,
      provider:      "paystack",
      transactionId: reference,
      status:        "PENDING",
      amount:        order.total,
    },
  });

  return ok({ authorizationUrl, accessCode, reference });
}

// ─── VERIFY ──────────────────────────────────────────────────
// POST /api/payments/verify
// Called by the frontend after Paystack redirects back.

export async function handleVerifyPaystackPayment(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.reference) return badRequest("reference is required");

  const tx = await verifyPaystackTransaction(body.reference);

  if (tx.status !== "success") {
    return badRequest(`Payment ${tx.status}. Please try again.`);
  }

  // Find payment by reference
  const payment = await db.payment.findFirst({
    where:   { transactionId: body.reference },
    include: { order: { include: { items: true } } },
  });

  if (!payment) return badRequest("Order not found for this transaction");
  if (payment.status === "SUCCESS") return ok({ orderId: payment.orderId }, "Already processed");

  // Verify amount matches
  if (tx.amount !== Number(payment.order.total)) {
    console.error(`[Paystack Verify] Amount mismatch: expected ${payment.order.total}, got ${tx.amount}`);
    return badRequest("Payment amount does not match order total");
  }

  // Mark as paid — two separate queries (Neon doesn't support interactive transactions)
  await db.payment.update({
    where: { id: payment.id },
    data:  { status: "SUCCESS", transactionId: body.reference },
  });
  await db.order.update({
    where: { id: payment.orderId },
    data:  { status: "PAID" },
  });

  console.log(`[Paystack Verify] ✅ Order ${payment.orderId} marked as PAID`);
  return ok({ orderId: payment.orderId }, "Payment verified successfully");
}

// ─── WEBHOOK ─────────────────────────────────────────────────
// POST /api/payments/paystack-webhook
// Called by Paystack server-to-server after every payment event.
// Must always return 200 — Paystack retries on any other status.

export async function handlePaystackWebhook(req: NextRequest) {
  const rawBody   = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    console.error("[Paystack Webhook] Missing x-paystack-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  if (!verifyPaystackWebhook(rawBody, signature)) {
    console.error("[Paystack Webhook] Signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  console.log(`[Paystack Webhook] Event: ${event.event}`);

  try {
    switch (event.event) {
      case "charge.success":
        await processSuccess(event.data);
        break;
      case "charge.failed":
        await processFailure(event.data);
        break;
      default:
        console.log(`[Paystack Webhook] Unhandled event type: ${event.event}`);
    }
  } catch (err) {
    console.error(`[Paystack Webhook] Processing error:`, err);
    // Still return 200 — we don't want Paystack to keep retrying
    return new Response("OK", { status: 200 });
  }

  return new Response("OK", { status: 200 });
}

// ─── PROCESS SUCCESS ──────────────────────────────────────────

async function processSuccess(data: any) {
  // Paystack puts your metadata inside data.metadata
  // orderId is stored there when we initialize the transaction
  const orderId   = data.metadata?.orderId;
  const reference = data.reference;
  const amount    = data.amount; // in cents

  if (!orderId) {
    console.error("[Paystack Webhook] No orderId in metadata — cannot process", data);
    return;
  }

  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: { payment: true },
  });

  if (!order) {
    console.error(`[Paystack Webhook] Order not found: ${orderId}`);
    return;
  }

  // Guard — don't double-process
  if (order.payment?.status === "SUCCESS") {
    console.log(`[Paystack Webhook] Order ${orderId} already paid — skipping`);
    return;
  }

  // Verify amount
  if (amount !== Number(order.total)) {
    console.error(`[Paystack Webhook] Amount mismatch for order ${orderId}: expected ${order.total}, got ${amount}`);
    return;
  }

  // Update payment and order — separate queries for Neon compatibility
  await db.payment.updateMany({
    where: { orderId, status: { not: "SUCCESS" } },
    data:  { status: "SUCCESS", transactionId: reference },
  });
  await db.order.update({
    where: { id: orderId },
    data:  { status: "PAID" },
  });

  console.log(`[Paystack Webhook] ✅ Order ${orderId} marked as PAID via webhook`);
}

// ─── PROCESS FAILURE ─────────────────────────────────────────

async function processFailure(data: any) {
  const orderId = data.metadata?.orderId;
  if (!orderId) {
    console.error("[Paystack Webhook] No orderId in metadata for failed payment");
    return;
  }

  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: { payment: true, items: true },
  });

  if (!order) {
    console.error(`[Paystack Webhook] Order not found: ${orderId}`);
    return;
  }

  // Mark payment as failed
  await db.payment.updateMany({
    where: { orderId },
    data:  { status: "FAILED" },
  });

  // Restore stock using callback transaction (safe on Neon)
  await db.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data:  { stock: { increment: item.quantity } },
      });
    }
  });

  // Keep order as PENDING so customer can retry
  console.log(`[Paystack Webhook] ❌ Payment failed for order ${orderId} — stock restored`);
}