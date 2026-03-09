// lib/payments/handlers.ts
// Payment API handlers.

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api/response";
import {
  buildPayFastForm,
  verifyITN,
  isValidPayFastIP,
  PAYFAST_CONFIG,
  type PayFastITN,
} from "@/lib/payments/payfast";

// ─── INITIATE PAYMENT ────────────────────────────────────────
// POST /api/payments/initiate
// Body: { orderId }
//
// Returns the PayFast form fields + action URL.
// The frontend renders a hidden <form> with these fields
// and submits it to redirect the user to PayFast's hosted payment page.

export async function handleInitiatePayment(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.orderId) return badRequest("orderId is required");

  // Load the order — must belong to the logged-in user
  const order = await db.order.findFirst({
    where: {
      id:     body.orderId,
      userId: user.sub,
    },
    include: {
      payment: true,
      user:    { select: { name: true, email: true } },
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

  // Build the signed PayFast form
  const { fields, actionUrl } = buildPayFastForm({
    orderId:     order.id,
    amountCents: order.total,
    buyerName:   order.user.name,
    buyerEmail:  order.user.email,
  });

  return ok({
    fields,     // POST these as form fields to actionUrl
    actionUrl,  // https://sandbox.payfast.co.za/eng/process (or live)
  });
}

// ─── ITN WEBHOOK ─────────────────────────────────────────────
// POST /api/payments/itn
// Called by PayFast after every payment event (COMPLETE, FAILED, CANCELLED).
//
// IMPORTANT SECURITY RULES:
//   - No auth cookie/header check (PayFast calls this server-to-server)
//   - Verify signature + IP whitelist + PayFast server confirmation
//   - Verify amount matches our order (prevent partial payment attacks)
//   - Verify merchant ID matches our config
//   - Always return HTTP 200 — PayFast retries on non-200
//   - Do NOT trust any data without verification

export async function handleITN(req: NextRequest) {
  // ── 1. IP Whitelist ───────────────────────────────────────
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : req.headers.get("x-real-ip") ?? "unknown";

  if (!isValidPayFastIP(ip)) {
    console.warn(`[PayFast ITN] Rejected request from unknown IP: ${ip}`);
    // Return 200 anyway — we don't want PayFast to keep retrying a spoofed request
    return new Response("IP not whitelisted", { status: 200 });
  }

  // ── 2. Parse raw body ─────────────────────────────────────
  // We need the raw body string for:
  //   a) PayFast server-side confirmation POST
  //   b) Signature verification (order-sensitive)
  const rawBody = await req.text();
  if (!rawBody) {
    console.warn("[PayFast ITN] Empty body received");
    return new Response("Empty body", { status: 200 });
  }

  // Parse URL-encoded form body into object
  const params = new URLSearchParams(rawBody);
  const payload = Object.fromEntries(params.entries()) as unknown as PayFastITN;

  console.log(`[PayFast ITN] Received — status: ${payload.payment_status}, m_payment_id: ${payload.m_payment_id}`);

  // ── 3. Verify ITN signature + server confirmation ─────────
  const { valid, reason } = await verifyITN(payload, rawBody);
  if (!valid) {
    console.error(`[PayFast ITN] Verification failed: ${reason}`);
    return new Response("Verification failed", { status: 200 });
  }

  // ── 4. Verify merchant ID ─────────────────────────────────
  if (payload.merchant_id !== PAYFAST_CONFIG.merchantId) {
    console.error(`[PayFast ITN] Merchant ID mismatch: ${payload.merchant_id}`);
    return new Response("Merchant ID mismatch", { status: 200 });
  }

  // ── 5. Load order from DB ─────────────────────────────────
  // m_payment_id = our orderId (set in buildPayFastForm)
  const orderId = payload.m_payment_id;
  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: { payment: true, items: true },
  });

  if (!order) {
    console.error(`[PayFast ITN] Order not found: ${orderId}`);
    return new Response("Order not found", { status: 200 });
  }

  // ── 6. Verify amount matches ──────────────────────────────
  // This prevents partial payment attacks where someone pays less
  const itnAmountCents = Math.round(parseFloat(payload.amount_gross) * 100);
  if (itnAmountCents !== order.total) {
    console.error(
      `[PayFast ITN] Amount mismatch for order ${orderId}: ` +
      `expected ${order.total} cents, got ${itnAmountCents} cents`
    );
    return new Response("Amount mismatch", { status: 200 });
  }

  // ── 7. Process payment status ─────────────────────────────
  await processITN(payload, order);

  // PayFast expects a plain 200 with no body
  return new Response(null, { status: 200 });
}

// ─── PROCESS ITN ─────────────────────────────────────────────

async function processITN(payload: PayFastITN, order: any) {
  const orderId = order.id;

  try {
    switch (payload.payment_status) {

      case "COMPLETE": {
        // Guard: don't process if already paid (duplicate ITN)
        if (order.payment?.status === "SUCCESS") {
          console.log(`[PayFast ITN] Order ${orderId} already marked as paid — skipping`);
          return;
        }

        await db.$transaction([
          // Update payment record
          db.payment.updateMany({
            where: { orderId },
            data: {
              status:        "SUCCESS",
              transactionId: payload.pf_payment_id,
            },
          }),
          // Update order status
          db.order.update({
            where: { id: orderId },
            data:  { status: "PAID" },
          }),
        ]);

        console.log(`[PayFast ITN] ✅ Order ${orderId} marked as PAID`);

        // TODO: Send order confirmation email to customer
        // await sendOrderConfirmationEmail(order.userId, orderId)
        break;
      }

      case "FAILED": {
        await db.$transaction(async (tx) => {
          // Update payment record
          await tx.payment.updateMany({
            where: { orderId },
            data:  { status: "FAILED" },
          });

          // Restore stock
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data:  { stock: { increment: item.quantity } },
            });
          }

          // Keep order as PENDING so user can try again
          // (don't change order status to allow retry)
        });

        console.log(`[PayFast ITN] ❌ Payment FAILED for order ${orderId} — stock restored`);

        // TODO: Send payment failed email
        // await sendPaymentFailedEmail(order.userId, orderId)
        break;
      }

      case "CANCELLED": {
        await db.$transaction(async (tx) => {
          await tx.payment.updateMany({
            where: { orderId },
            data:  { status: "CANCELLED" },
          });

          // Restore stock
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data:  { stock: { increment: item.quantity } },
            });
          }

          await tx.order.update({
            where: { id: orderId },
            data:  { status: "CANCELLED" },
          });
        });

        console.log(`[PayFast ITN] 🚫 Payment CANCELLED for order ${orderId} — stock restored`);
        break;
      }

      default:
        console.warn(`[PayFast ITN] Unknown payment_status: ${payload.payment_status}`);
    }
  } catch (err) {
    console.error(`[PayFast ITN] DB update failed for order ${orderId}:`, err);
    // Don't throw — we already returned 200 to PayFast
  }
}