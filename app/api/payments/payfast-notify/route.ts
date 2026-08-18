// app/api/payments/payfast-notify/route.ts
// PayFast ITN (Instant Transaction Notification)
// PayFast POSTs to this endpoint after every payment — server to server.
// Must return 200. Do NOT require auth — verified via signature instead.
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { verifyPayFastSignature, verifyPayFastPayment, PAYFAST_CONFIG } from "@/lib/payments/payfast";
import { sendOrderConfirmedEmail } from "@/lib/emails/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const text    = await req.text();
  const params  = Object.fromEntries(new URLSearchParams(text));

  console.log("[PayFast ITN] Received:", params);

  // 1. Verify signature
  if (!verifyPayFastSignature(params, PAYFAST_CONFIG.passphrase)) {
    console.error("[PayFast ITN] Invalid signature");
    return new Response("Invalid signature", { status: 400 });
  }

  // 2. Verify with PayFast server
  const isValid = await verifyPayFastPayment(params);
  if (!isValid) {
    console.error("[PayFast ITN] Payment validation failed");
    return new Response("Validation failed", { status: 400 });
  }

  const orderId        = params.m_payment_id ?? params.custom_str1;
  const paymentStatus  = params.payment_status; // "COMPLETE" | "FAILED" | "CANCELLED"
  const amountRands    = parseFloat(params.amount_gross ?? "0");
  const amountCents    = Math.round(amountRands * 100);

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
    // Guard — don't double-process
    if (order.payment?.status === "SUCCESS") {
      console.log(`[PayFast ITN] Order ${orderId} already paid — skipping`);
      return new Response("OK", { status: 200 });
    }

    // Verify amount matches
    if (amountCents !== Number(order.total)) {
      console.error(`[PayFast ITN] Amount mismatch: expected ${order.total}, got ${amountCents}`);
      return new Response("OK", { status: 200 });
    }

    await db.payment.updateMany({
      where: { orderId, status: { not: "SUCCESS" } },
      data:  { status: "SUCCESS", transactionId: params.pf_payment_id ?? orderId },
    });
    await db.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    // Send confirmation email (non-blocking)
    buildOrderEmailParams(orderId).then(p => sendOrderConfirmedEmail(p)).catch(console.error);

    console.log(`[PayFast ITN] Order ${orderId} marked as PAID`);

  } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
    await db.payment.updateMany({ where: { orderId }, data: { status: "FAILED" } });
    console.log(`[PayFast ITN] Payment ${paymentStatus} for order ${orderId}`);
  }

  return new Response("OK", { status: 200 });
}

async function buildOrderEmailParams(orderId: string) {
  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: {
      user:    { select: { name: true, email: true } },
      address: true,
      items:   {
        include: {
          variant: { include: { product: { select: { name: true } } } },
        },
      },
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
    address:  order.address ? {
      fullName:   order.address.fullName,
      street:     order.address.street,
      city:       order.address.city,
      province:   order.address.province,
      postalCode: order.address.postalCode,
      country:    order.address.country,
    } : { fullName: "", street: "", city: "", province: "", postalCode: "", country: "South Africa" },
  };
}