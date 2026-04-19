// app/api/payments/paystack-webhook/route.ts
// Receives Paystack webhook events server-to-server.
// Must always return 200 — Paystack retries on any other status.
// No auth required — verified via x-paystack-signature header instead.

import { NextRequest } from "next/server";
import { handlePaystackWebhook } from "@/lib/payments/paystack-handlers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handlePaystackWebhook(req);
}