// lib/payments/payfast.ts
// PayFast integration core.
//
// Payment flow:
//   1. POST /api/payments/initiate  → returns signed form fields
//   2. Frontend renders hidden <form> and submits to PayFast
//   3. User pays on PayFast hosted page
//   4. PayFast POSTs ITN to /api/payments/itn (server-to-server)
//   5. We verify ITN → update order + payment status
//   6. User is redirected to /checkout/success or /checkout/cancelled
//
// Test credentials (sandbox):
//   Merchant ID:  10004002
//   Merchant Key: q1cd2rdny4a53
//   Passphrase:   jt7NOE43FZPn
//
// Test cards:
//   Visa:       4000000000000002
//   MasterCard: 5200000000000015

import crypto from "crypto";

// ─── CONFIG ──────────────────────────────────────────────────

export const PAYFAST_CONFIG = {
  merchantId:  process.env.PAYFAST_MERCHANT_ID!,
  merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
  passphrase:  process.env.PAYFAST_PASSPHRASE!,
  appUrl:      process.env.NEXT_PUBLIC_APP_URL!,
  // Sandbox vs Live URL
  processUrl:
    process.env.NODE_ENV === "production"
      ? "https://www.payfast.co.za/eng/process"
      : "https://sandbox.payfast.co.za/eng/process",
  validateUrl:
    process.env.NODE_ENV === "production"
      ? "https://www.payfast.co.za/eng/query/validate"
      : "https://sandbox.payfast.co.za/eng/query/validate",
};

// ─── TYPES ───────────────────────────────────────────────────

export interface PayFastFormFields {
  merchant_id:       string;
  merchant_key:      string;
  return_url:        string;
  cancel_url:        string;
  notify_url:        string;
  name_first:        string;
  name_last:         string;
  email_address:     string;
  m_payment_id:      string; // our orderId — echoed back in ITN
  amount:            string; // in RANDS with 2 decimal places e.g. "1899.00"
  item_name:         string;
  item_description?: string;
  custom_str1?:      string; // we store orderId here for ITN reconciliation
  signature:         string;
}

export interface PayFastITN {
  m_payment_id:      string;
  pf_payment_id:     string; // PayFast's internal transaction ID
  payment_status:    "COMPLETE" | "FAILED" | "CANCELLED";
  item_name:         string;
  item_description?: string;
  amount_gross:      string;
  amount_fee:        string;
  amount_net:        string;
  custom_str1?:      string; // our orderId
  name_first?:       string;
  name_last?:        string;
  email_address?:    string;
  merchant_id:       string;
  signature:         string;
}

// ─── SIGNATURE ───────────────────────────────────────────────
// PayFast signature = MD5 of all non-empty params as a query string
// with the passphrase appended at the end.
// Order of fields matters — must match the order they were added.

export function buildPayFastSignature(
  data: Record<string, string>
): string {
  const paramString = Object.entries(data)
    .filter(([, v]) => v !== "" && v !== undefined && v !== null)
    .map(
      ([k, v]) =>
        `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, "+")}`
    )
    .join("&");

  const stringToHash =
    PAYFAST_CONFIG.passphrase
      ? `${paramString}&passphrase=${encodeURIComponent(PAYFAST_CONFIG.passphrase.trim()).replace(/%20/g, "+")}`
      : paramString;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

// ─── BUILD PAYMENT FORM ──────────────────────────────────────
// Builds the signed form fields to submit to PayFast.
// Amount must be in CENTS (from DB) — we convert to rands here.

export function buildPayFastForm(params: {
  orderId:     string;
  amountCents: number;
  buyerName:   string;
  buyerEmail:  string;
  buyerPhone?: string;
}): { fields: PayFastFormFields; actionUrl: string } {
  const [firstName, ...rest] = params.buyerName.trim().split(" ");
  const lastName = rest.join(" ") || firstName; // fallback if single name

  // Convert cents to rands with exactly 2 decimal places
  const amountRands = (params.amountCents / 100).toFixed(2);

  // Build fields in the exact order PayFast expects
  const fields: Record<string, string> = {
    merchant_id:     PAYFAST_CONFIG.merchantId,
    merchant_key:    PAYFAST_CONFIG.merchantKey,
    return_url:      `${PAYFAST_CONFIG.appUrl}/checkout/success?orderId=${params.orderId}`,
    cancel_url:      `${PAYFAST_CONFIG.appUrl}/checkout/cancelled?orderId=${params.orderId}`,
    notify_url:      `${PAYFAST_CONFIG.appUrl}/api/payments/itn`,
    name_first:      firstName,
    name_last:       lastName,
    email_address:   params.buyerEmail,
    m_payment_id:    params.orderId,
    amount:          amountRands,
    item_name:       `WigStore Order`,
    item_description: `Payment for order ${params.orderId.slice(0, 8).toUpperCase()}`,
    custom_str1:     params.orderId, // echoed back in ITN
  };

  // Signature is built WITHOUT merchant_key
  const { merchant_key, ...fieldsForSignature } = fields;
  const signature = buildPayFastSignature(fieldsForSignature);

  return {
    fields:     { ...fields, signature } as PayFastFormFields,
    actionUrl:  PAYFAST_CONFIG.processUrl,
  };
}

// ─── VERIFY ITN ──────────────────────────────────────────────
// Three-step verification as per PayFast docs:
//   1. Verify signature
//   2. Confirm with PayFast server (server-to-server POST)
//   3. Caller must verify merchant ID + amount match order

export async function verifyITN(
  payload: PayFastITN,
  rawBody: string
): Promise<{ valid: boolean; reason?: string }> {
  // Step 1 — Signature verification
  const { signature, ...rest } = payload;
  const expected = buildPayFastSignature(rest as Record<string, string>);

  if (signature !== expected) {
    return {
      valid:  false,
      reason: `Signature mismatch — expected ${expected}, got ${signature}`,
    };
  }

  // Step 2 — Server-side confirmation
  const confirmed = await confirmWithPayFast(rawBody);
  if (!confirmed) {
    return {
      valid:  false,
      reason: "PayFast server returned INVALID for confirmation request",
    };
  }

  return { valid: true };
}

async function confirmWithPayFast(rawBody: string): Promise<boolean> {
  try {
    const res = await fetch(PAYFAST_CONFIG.validateUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    rawBody,
    });
    const text = await res.text();
    return text.trim() === "VALID";
  } catch (err) {
    console.error("[PayFast] Server confirmation request failed:", err);
    return false;
  }
}

// ─── IP WHITELIST ────────────────────────────────────────────
// PayFast only sends ITN from these IP ranges.
// In development, all IPs are allowed.

const PAYFAST_IP_RANGES = new Set([
  // Production
  "197.97.145.144", "197.97.145.145", "197.97.145.146", "197.97.145.147",
  "197.97.145.148", "197.97.145.149", "197.97.145.150", "197.97.145.151",
  "196.33.227.224", "196.33.227.225", "196.33.227.226", "196.33.227.227",
  "196.33.227.228", "196.33.227.229", "196.33.227.230", "196.33.227.231",
  // Localhost for dev/testing
  "127.0.0.1", "::1", "::ffff:127.0.0.1",
]);

export function isValidPayFastIP(ip: string): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return PAYFAST_IP_RANGES.has(ip);
}