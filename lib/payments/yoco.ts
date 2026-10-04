// lib/payments/yoco.ts
import { createHmac, timingSafeEqual } from "crypto";
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
// Yoco signs webhooks Standard-Webhooks style:
//   signed content = `${webhook-id}.${webhook-timestamp}.${rawBody}`
//   key            = base64-decoded secret (without the "whsec_" prefix)
//   signature      = base64(HMAC-SHA256), sent as "v1,<sig>" in `webhook-signature`
//                    (the header may hold several space-separated signatures)
// Docs: https://developer.yoco.com/guides/online-payments/webhooks/verifying-the-events
const WEBHOOK_TOLERANCE_SECONDS = 180; // 3 minutes, as recommended by Yoco

export function verifyYocoWebhook(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string
): boolean {
  try {
    const { id, timestamp, signature } = headers;
    if (!id || !timestamp || !signature || !secret) return false;

    // Replay protection
    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) return false;
    if (Math.abs(Date.now() / 1000 - ts) > WEBHOOK_TOLERANCE_SECONDS) return false;

    const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
    const expected = createHmac("sha256", key)
      .update(`${id}.${timestamp}.${rawBody}`)
      .digest("base64");
    const expectedBuf = Buffer.from(expected);

    return signature.split(" ").some((part) => {
      const [version, sig] = part.split(",");
      if (version !== "v1" || !sig) return false;
      const sigBuf = Buffer.from(sig);
      return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
    });
  } catch {
    return false;
  }
}