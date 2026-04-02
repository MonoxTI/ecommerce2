// app/api/payments/paystack-webhook/route.ts
//
// ⚠️  CRITICAL: This endpoint receives Paystack webhooks.
//
// Rules:
//   - Must return HTTP 200 always (Paystack retries on non-200)
//   - Must NOT require authentication (Paystack calls this server-to-server)
//   - Must read raw body for signature verification
//   - Must be reachable from the internet

import { NextRequest } from "next/server";
import { handlePaystackWebhook } from "@/lib/payments/paystack-handlers";

// FIX: force-dynamic prevents Next.js from caching this route.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handlePaystackWebhook(req);
}