// app/api/payments/itn/route.ts
import { NextRequest } from "next/server";
import { handlePayFastITN } from "@/lib/payments/handlers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handlePayFastITN(req);
}