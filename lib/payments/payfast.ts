// lib/payments/payfast.ts
// PayFast integration for novaa
// Docs: https://developers.payfast.co.za/docs

import crypto from "crypto";

export const PAYFAST_CONFIG = {
  merchantId:  process.env.PAYFAST_MERCHANT_ID!,
  merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
  passphrase:  process.env.PAYFAST_PASSPHRASE ?? "",
  url: process.env.NODE_ENV === "production"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process",
};

export interface PayFastParams {
  orderId:     string;
  amountCents: number;
  email:       string;
  firstName:   string;
  lastName:    string;
  itemName:    string;
}

// Generate MD5 signature
function generateSignature(data: Record<string, string>, passphrase?: string): string {
  const params = { ...data };
  if (passphrase) params.passphrase = passphrase;
  const str = Object.keys(params)
    .sort()
    .filter(k => params[k] !== "" && params[k] !== undefined)
    .map(k => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");
  return crypto.createHash("md5").update(str).digest("hex");
}

// Build form fields to POST to PayFast
export function buildPayFastData(params: PayFastParams): {
  actionUrl: string;
  fields:    Record<string, string>;
} {
  const appUrl      = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const amountRands = (params.amountCents / 100).toFixed(2);

  const data: Record<string, string> = {
    merchant_id:   PAYFAST_CONFIG.merchantId,
    merchant_key:  PAYFAST_CONFIG.merchantKey,
    return_url:    `${appUrl}/checkout/success?orderId=${params.orderId}`,
    cancel_url:    `${appUrl}/checkout/cancelled?orderId=${params.orderId}`,
    notify_url:    `${appUrl}/api/payments/payfast-notify`,
    name_first:    params.firstName,
    name_last:     params.lastName,
    email_address: params.email,
    m_payment_id:  params.orderId,
    amount:        amountRands,
    item_name:     params.itemName,
    custom_str1:   params.orderId,
  };

  Object.keys(data).forEach(k => { if (!data[k]) delete data[k]; });
  data.signature = generateSignature(data, PAYFAST_CONFIG.passphrase);

  return { actionUrl: PAYFAST_CONFIG.url, fields: data };
}

// Verify PayFast ITN signature
export function verifyPayFastSignature(data: Record<string, string>, passphrase?: string): boolean {
  const received = data.signature;
  const params   = { ...data };
  delete params.signature;
  const expected = generateSignature(params, passphrase);
  return received === expected;
}

// Server-side payment validation with PayFast
export async function verifyPayFastPayment(pfData: Record<string, string>): Promise<boolean> {
  const host = process.env.NODE_ENV === "production"
    ? "https://www.payfast.co.za"
    : "https://sandbox.payfast.co.za";

  const str = Object.keys(pfData)
    .map(k => `${k}=${encodeURIComponent(pfData[k]).replace(/%20/g, "+")}`)
    .join("&");

  const res  = await fetch(`${host}/eng/query/validate`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    str,
  });
  const text = await res.text();
  return text === "VALID";
}