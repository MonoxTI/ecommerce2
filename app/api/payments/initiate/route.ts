// app/api/payments/initiate/route.ts

import { NextRequest } from "next/server";
import { handleInitiatePayment } from "@/lib/payments/handlers";

// POST /api/payments/initiate
// Body: { "orderId": "uuid" }
//
// Returns:
// {
//   "fields": { merchant_id, amount, signature, ... },
//   "actionUrl": "https://sandbox.payfast.co.za/eng/process"
// }
//
// Frontend usage:
//   1. Receive fields + actionUrl
//   2. Render a hidden <form method="POST" action={actionUrl}>
//      with an <input> for each field
//   3. Auto-submit the form → redirects user to PayFast

export async function POST(req: NextRequest) {
  return handleInitiatePayment(req);
}