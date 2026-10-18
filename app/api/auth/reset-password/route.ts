// app/api/auth/reset-password/route.ts
import { NextRequest } from "next/server";
import { handleResetPassword } from "@/lib/auth/handler";

export async function POST(req: NextRequest) {
  return handleResetPassword(req);
}