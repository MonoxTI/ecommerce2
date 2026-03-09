// app/api/admin/orders/[id]/tracking/route.ts

import { NextRequest } from "next/server";
import { handleAddTracking } from "@/lib/orders/handlers";

// PATCH /api/admin/orders/[id]/tracking
// Body: { trackingNumber: "CG123456789ZA", trackingUrl?: "https://..." }
// Also automatically sets order status to SHIPPED and records shippedAt

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleAddTracking(req, id);
}