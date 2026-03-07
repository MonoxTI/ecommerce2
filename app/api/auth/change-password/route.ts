// app/api/auth/change-password/route.ts
import { NextRequest } from "next/server";
import { handleChangePassword } from "@/lib/auth/handler";

export async function POST(req: NextRequest) {
  return handleChangePassword(req);
}