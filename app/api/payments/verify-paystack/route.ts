// app/api/payments/verify-paystack/route.ts

import { NextRequest } from "next/server";
import { handleVerifyPaystackPayment } from "@/lib/payments/paystack-handlers";

// POST /api/payments/verify-paystack
// Body: { "reference": "order_uuid_timestamp" }
//
// Returns payment verification status

export async function POST(req: NextRequest) {
  return handleVerifyPaystackPayment(req);
}