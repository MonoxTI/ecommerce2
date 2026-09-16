// lib/payments/yoco.ts
// Yoco Online Payments — docs: https://developer.yoco.com/online/

export const YOCO_CONFIG = {
  secretKey:  process.env.YOCO_SECRET_KEY!,
  publicKey:  process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY!,
  apiUrl:     "https://payments.yoco.com/api",
  webhookSecret: process.env.YOCO_WEBHOOK_SECRET ?? "",
};

// ─── CREATE CHECKOUT SESSION ──────────────────────────────────
// Yoco creates a checkout session and returns a redirect URL

export async function createYocoCheckout(params: {
  orderId:     string;
  amountCents: number;   // in cents (ZAR)
  currency?:   string;
  successUrl:  string;
  cancelUrl:   string;
}): Promise<{ id: string; redirectUrl: string }> {
  const res = await fetch(`${YOCO_CONFIG.apiUrl}/checkouts`, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${YOCO_CONFIG.secretKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      amount:      params.amountCents,
      currency:    params.currency ?? "ZAR",
      successUrl:  params.successUrl,
      cancelUrl:   params.cancelUrl,
      failureUrl:  params.cancelUrl,
      metadata: {
        orderId: params.orderId,
        checkoutId: params.orderId,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.errorMessage ?? `Yoco checkout failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    id:          data.id,
    redirectUrl: data.redirectUrl,
  };
}

// ─── VERIFY WEBHOOK SIGNATURE ─────────────────────────────────
export function verifyYocoWebhook(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require("crypto");
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return expected === signature;
  } catch {
    return false;
  }
}