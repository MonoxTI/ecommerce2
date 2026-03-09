// app/api/orders/[id]/route.ts

import { NextRequest } from "next/server";
import { handleGetOrder } from "@/lib/orders/handlers";

// GET /api/orders/[id]  → get single order (own orders only)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetOrder(req, id);
}