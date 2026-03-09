// app/api/orders/[id]/cancel/route.ts

import { NextRequest } from "next/server";
import { handleCancelOrder } from "@/lib/orders/handlers";

// PATCH /api/orders/[id]/cancel
// Only works for PENDING orders (before payment)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleCancelOrder(req, id);
}