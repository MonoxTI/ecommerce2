// app/api/payments/itn/route.ts
//
// ⚠️  CRITICAL: This endpoint receives PayFast's Instant Transaction Notification.
//
// Rules:
//   - Must return HTTP 200 always (PayFast retries on non-200 for up to 6 hours)
//   - Must NOT require authentication (PayFast calls this server-to-server)
//   - Must read raw body (not parsed JSON) for signature verification
//   - Must be reachable from the internet (won't work on localhost without ngrok)
//
// For local testing use ngrok:
//   npx ngrok http 3000
//   Then set NEXT_PUBLIC_APP_URL=https://xxxx.ngrok.io in .env.local

import { NextRequest } from "next/server";
import { handleITN } from "@/lib/payments/handlers";

export async function POST(req: NextRequest) {
  return handleITN(req);
}