// lib/payments/paystack.ts
//
// Flow:
//   1. POST /api/payments/initiate  → calls Paystack API → returns access_code + reference
//   2. Frontend opens Paystack popup using access_code
//   3. User pays → Paystack calls your callback_url
//   4. POST /api/payments/verify    → verifies with Paystack → updates order to PAID
//
import { createHmac } from "crypto";

// Test card: 4084084084084081  CVV: 408  Expiry: any future  PIN: 0000  OTP: 123456

export const PAYSTACK_CONFIG = {
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  baseUrl:   "https://api.paystack.co",
  currency:  "ZAR",
};

// ─── INITIALIZE ───────────────────────────────────────────────
// Called from your backend. Returns access_code for the popup.

export async function initializePaystackTransaction(params: {
  orderId:     string;
  amountCents: number;
  email:       string;
  callbackUrl: string;
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const res = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      email:        params.email,
      amount:       params.amountCents,
      currency:     PAYSTACK_CONFIG.currency,
      reference:    `order_${params.orderId}_${Date.now()}`,
      callback_url: params.callbackUrl,
      metadata: {
        orderId:       params.orderId,
        cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancelled?orderId=${params.orderId}`,
      },
    }),
  });

  const data = await res.json();
  if (!data.status) throw new Error(data.message ?? "Failed to initialize Paystack transaction");

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode:       data.data.access_code,
    reference:        data.data.reference,
  };
}

// ─── VERIFY ───────────────────────────────────────────────────
// Always verify on the server — never trust the frontend result.

export async function verifyPaystackTransaction(reference: string): Promise<{
  status:     "success" | "failed" | "abandoned";
  amount:     number;
  email:      string;
  orderId:    string | null;
  paystackId: string;
}> {
  const res = await fetch(
    `${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { "Authorization": `Bearer ${PAYSTACK_CONFIG.secretKey}` } }
  );

  const data = await res.json();
  if (!data.status) throw new Error(data.message ?? "Failed to verify transaction");

  const tx = data.data;
  return {
    status:     tx.status,
    amount:     tx.amount,
    email:      tx.customer.email,
    orderId:    tx.metadata?.orderId ?? null,
    paystackId: String(tx.id),
  };
}

export function verifyPaystackWebhook(rawBody: string, signature: string): boolean {
  const expected = createHmac("sha512", PAYSTACK_CONFIG.secretKey)
    .update(rawBody)
    .digest("hex");

  return expected === signature;
}