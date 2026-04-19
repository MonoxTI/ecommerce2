// app/api/payments/initiate/route.ts
import { NextRequest } from "next/server";
import { handleInitiatePaystackPayment } from "@/lib/payments/paystack-handlers";

export async function POST(req: NextRequest) {
  return handleInitiatePaystackPayment(req);
}