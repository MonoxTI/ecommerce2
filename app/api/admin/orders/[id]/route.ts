// app/api/admin/orders/[id]/route.ts

import { NextRequest } from "next/server";
import { handleAdminGetOrder } from "@/lib/orders/handlers";

// GET /api/admin/orders/[id]  → full order detail with customer info

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleAdminGetOrder(req, id);
}