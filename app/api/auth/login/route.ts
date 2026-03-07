// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { handleLogin } from "@/lib/auth/handler";

export async function POST(req: NextRequest) {
  return handleLogin(req);
}