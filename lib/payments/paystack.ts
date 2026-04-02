// lib/payments/paystack.ts
// Paystack payment integration.
//
// Flow:
//   1. POST /api/payments/initiate  → calls Paystack API → returns authorization_url
//   2. Frontend redirects user to authorization_url
//   3. User pays on Paystack hosted page
//   4. Paystack redirects to callback_url (/checkout/success?reference=xxx)
//   5. Paystack POSTs charge.success webhook to /api/payments/webhook
//   6. We verify webhook → update order + payment status
//
// Test cards: https://paystack.com/docs/developer-tools/test-bank-accounts
//   Card:      4084084084084081  CVV: 408  Expiry: 01/99  PIN: 0000  OTP: 123456
//   Card (3DS): 5060666666666666666  CVV: 123  Expiry: 01/99  PIN: 1234  OTP: 123456

import crypto from "crypto";

export const PAYSTACK_CONFIG = {
  secretKey:  process.env.PAYSTACK_SECRET_KEY!,
  publicKey:  process.env.PAYSTACK_PUBLIC_KEY!,
  appUrl:     process.env.NEXT_PUBLIC_APP_URL!,
  baseUrl:    "https://api.paystack.co",
};

// ─── INITIALIZE TRANSACTION ──────────────────────────────────
// Called server-side — never expose secret key to client.
// Returns the authorization_url to redirect the user to.

export async function initializePaystackTransaction(params: {
  orderId:     string;
  amountCents: number; // in ZAR cents — R189.99 = 18999
  email:       string;
  firstName:   string;
  lastName:    string;
}): Promise<{ authorizationUrl: string; reference: string } | null> {
  try {
    const res = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email:        params.email,
        amount:       params.amountCents,       // Paystack uses kobo/cents — same as your DB
        currency:     "ZAR",                    // South African Rand
        reference:    `order_${params.orderId}_${Date.now()}`,
        callback_url: `${PAYSTACK_CONFIG.appUrl}/checkout/success`,
        metadata: {
          orderId:    params.orderId,
          first_name: params.firstName,
          last_name:  params.lastName,
          custom_fields: [
            {
              display_name:  "Order ID",
              variable_name: "order_id",
              value:         params.orderId,
            },
          ],
        },
      }),
    });

    const json = await res.json();

    if (!json.status) {
      console.error("[Paystack] Initialize failed:", json.message);
      return null;
    }

    return {
      authorizationUrl: json.data.authorization_url,
      reference:        json.data.reference,
    };
  } catch (err) {
    console.error("[Paystack] Initialize error:", err);
    return null;
  }
}

// ─── VERIFY TRANSACTION ──────────────────────────────────────
// Call this after redirect OR to double-check a webhook.
// Returns the verified transaction data or null.

export async function verifyPaystackTransaction(reference: string): Promise<{
  status:  "success" | "failed" | "abandoned";
  amount:  number;   // in cents
  orderId: string;
  email:   string;
  paystackRef: string;
} | null> {
  try {
    const res = await fetch(
      `${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}` },
      }
    );

    const json = await res.json();

    if (!json.status || !json.data) {
      console.error("[Paystack] Verify failed:", json.message);
      return null;
    }

    const data = json.data;

    return {
      status:      data.status,           // "success" | "failed" | "abandoned"
      amount:      data.amount,           // in cents (same as your DB)
      orderId:     data.metadata?.orderId ?? "",
      email:       data.customer?.email   ?? "",
      paystackRef: data.reference,
    };
  } catch (err) {
    console.error("[Paystack] Verify error:", err);
    return null;
  }
}

// ─── VERIFY WEBHOOK SIGNATURE ────────────────────────────────
// Paystack signs every webhook with HMAC-SHA512.
// Always verify this before processing to prevent fake webhooks.

export function verifyPaystackWebhook(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const hash = crypto
    .createHmac("sha512", PAYSTACK_CONFIG.secretKey)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}