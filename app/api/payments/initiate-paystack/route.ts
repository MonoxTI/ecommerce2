// app/api/payments/initiate-paystack/route.ts

import { NextRequest } from "next/server";
import { handleInitiatePaystackPayment } from "@/lib/payments/paystack-handlers";

// POST /api/payments/initiate-paystack
// Body: { "orderId": "uuid" }
//
// Returns:
// {
//   "authorizationUrl": "https://checkout.paystack.com/...",
//   "reference": "order_uuid_timestamp"
// }
//
// Frontend usage:
//   1. Call this API to get authorizationUrl
//   2. Redirect user to authorizationUrl
//   3. Paystack handles payment and redirects back

export async function POST(req: NextRequest) {
  return handleInitiatePaystackPayment(req);
}