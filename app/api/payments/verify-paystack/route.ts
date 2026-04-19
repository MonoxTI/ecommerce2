// app/api/payments/verify/route.ts
// Called by the frontend after Paystack redirects the user back.

import { NextRequest } from "next/server";
import { handleVerifyPaystackPayment } from "@/lib/payments/paystack-handlers";

export async function POST(req: NextRequest) {
  return handleVerifyPaystackPayment(req);
}