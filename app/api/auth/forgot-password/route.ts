// app/api/auth/forgot-password/route.ts
import { NextRequest } from "next/server";
import { handleForgotPassword } from "@/lib/auth/handler";

export async function POST(req: NextRequest) {
  return handleForgotPassword(req);
}