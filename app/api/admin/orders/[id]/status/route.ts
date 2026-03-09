// app/api/admin/orders/[id]/status/route.ts

import { NextRequest } from "next/server";
import { handleUpdateOrderStatus } from "@/lib/orders/handlers";

// PATCH /api/admin/orders/[id]/status
// Body: { "status": "SHIPPED" }
// Valid statuses: PENDING | PAID | SHIPPED | DELIVERED | CANCELLED

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateOrderStatus(req, id);
}