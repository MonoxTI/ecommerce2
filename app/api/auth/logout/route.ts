// app/api/auth/logout/route.ts
import { NextRequest } from "next/server";
import { handleLogout } from "@/lib/auth/handler";

export async function POST(req: NextRequest) {
  return handleLogout(req);
}