// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { handleRegister } from "@/lib/auth/handler";

export async function POST(req: NextRequest) {
  return handleRegister(req);
}