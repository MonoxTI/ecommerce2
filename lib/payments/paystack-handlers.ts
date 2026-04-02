// lib/payments/paystack-handlers.ts
// Paystack API handlers.

import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import {
  ok,
  badRequest,
  unauthorized,
  notFound,
} from "@/lib/api/response";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  verifyPaystackWebhook,
} from "@/lib/payments/paystack";

// ─── TYPES ───────────────────────────────────────────────────

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    payment: true;
    items: true;
  };
}>;

// ─── INITIATE PAYSTACK PAYMENT ───────────────────────────────
// POST /api/payments/initiate-paystack
// Body: { orderId }
//
// Returns the Paystack authorization URL for redirect.

export async function handleInitiatePaystackPayment(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.orderId) return badRequest("orderId is required");

  // Load the order — must belong to the logged-in user
  const order = await db.order.findFirst({
    where: {
      id: body.orderId,
      userId: user.sub,
    },
    include: {
      payment: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order) return notFound("Order not found");

  // Guards
  if (order.payment?.status === "SUCCESS") {
    return badRequest("This order has already been paid");
  }
  if (order.status === "CANCELLED") {
    return badRequest("This order has been cancelled");
  }
  if (!["PENDING"].includes(order.status)) {
    return badRequest(`Order status is "${order.status}" — payment not expected`);
  }

  // Initiate Paystack payment
  const [firstName, ...rest] = order.user.name.trim().split(" ");
  const lastName = rest.join(" ") || firstName;
  
  const result = await initializePaystackTransaction({
    orderId: order.id,
    amountCents: Number(order.total),
    email: order.user.email,
    firstName,
    lastName,
  });
  
  if (!result) return badRequest("Failed to initialize Paystack payment");
  
  const { authorizationUrl, reference } = result;

  // Store the payment reference in the database
  await db.payment.upsert({
    where: { orderId: order.id },
    update: {
      transactionId: reference,
      provider: "paystack",
    },
    create: {
      orderId: order.id,
      provider: "paystack",
      transactionId: reference,
      status: "PENDING",
      amount: order.total,
    },
  });

  return ok({
    authorizationUrl,
    reference,
  });
}

// ─── VERIFY PAYMENT ──────────────────────────────────────────
// POST /api/payments/verify-paystack
// Body: { reference }
//
// Verifies a Paystack payment (can be called from callback or webhook)

export async function handleVerifyPaystackPayment(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.reference) return badRequest("reference is required");

  const paymentData = await verifyPaystackTransaction(body.reference);
  
  if (!paymentData) {
    return badRequest("Payment verification failed");
  }

  if (paymentData.status === "success") {
    await processPaymentSuccess(paymentData);
    return ok({ status: "success", orderId: paymentData.orderId });
  } else {
    await processPaymentFailure(paymentData);
    return ok({ status: "failed", orderId: paymentData.orderId });
  }
}

// ─── PAYSTACK WEBHOOK ────────────────────────────────────────
// POST /api/payments/paystack-webhook
// Called by Paystack after payment events.

export async function handlePaystackWebhook(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    console.error("[Paystack Webhook] Missing signature");
    return new Response("Missing signature", { status: 400 });
  }

  if (!verifyPaystackWebhook(rawBody, signature)) {
    console.error("[Paystack Webhook] Invalid signature");
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);

  console.log(`[Paystack Webhook] Received event: ${event.event}`);

  try {
    switch (event.event) {
      case "charge.success":
        await processPaymentSuccess(event.data);
        break;

      case "charge.failed":
        await processPaymentFailure(event.data);
        break;

      default:
        console.log(`[Paystack Webhook] Unhandled event: ${event.event}`);
    }
  } catch (err) {
    console.error(`[Paystack Webhook] Processing failed: ${err}`);
    return new Response("Processing failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

// ─── PROCESS PAYMENT SUCCESS ─────────────────────────────────

async function processPaymentSuccess(paymentData: any) {
  const orderId = paymentData.orderId;
  if (!orderId) {
    console.error("[Paystack] Missing orderId in payment data");
    return;
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true, items: true },
  });

  if (!order) {
    console.error(`[Paystack] Order not found: ${orderId}`);
    return;
  }

  // Verify amount matches
  if (paymentData.amount !== Number(order.total)) {
    console.error(`[Paystack] Amount mismatch for order ${orderId}: expected ${order.total} cents, got ${paymentData.amount}`);
    return;
  }

  // Update payment and order status
  await db.$transaction([
    db.payment.updateMany({
      where: {
        orderId,
        status: { not: "SUCCESS" },
      },
      data: {
        status: "SUCCESS",
        transactionId: paymentData.paystackRef,
      },
    }),
    db.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    }),
  ]);

  console.log(`[Paystack] ✅ Order ${orderId} marked as PAID`);
}

// ─── PROCESS PAYMENT FAILURE ─────────────────────────────────

async function processPaymentFailure(paymentData: any) {
  const orderId = paymentData.orderId;
  if (!orderId) {
    console.error("[Paystack] Missing orderId in payment data");
    return;
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true, items: true },
  });

  if (!order) {
    console.error(`[Paystack] Order not found: ${orderId}`);
    return;
  }

  // Update payment status and restore stock
  await db.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { orderId },
      data: { status: "FAILED" },
    });

    // Restore stock for each item
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Keep order as PENDING so user can retry
  });

  console.log(`[Paystack] ❌ Payment FAILED for order ${orderId} — stock restored`);
}