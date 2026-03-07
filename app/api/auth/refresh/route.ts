// app/api/auth/refresh/route.ts
import { NextRequest } from "next/server";
import { handleRefresh } from "@/lib/auth/handler";

export async function POST(req: NextRequest) {
  return handleRefresh(req);
}