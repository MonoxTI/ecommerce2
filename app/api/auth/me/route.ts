// app/api/auth/me/route.ts
import { NextRequest } from "next/server";
import { handleMe } from "@/lib/auth/handler";

export async function GET(req: NextRequest) {
  return handleMe(req);
}