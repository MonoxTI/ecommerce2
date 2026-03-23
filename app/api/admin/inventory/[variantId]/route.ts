// app/api/admin/inventory/[variantId]/route.ts
import { NextRequest } from "next/server";
import { handleAddStock } from "@/lib/admin/inventory.handlers";

// PATCH /api/admin/inventory/[variantId]
// Body: { "quantity": 50 }             → adds 50 units to current stock
// Body: { "quantity": 50, "set": true } → sets stock to exactly 50
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { variantId } = await params;
  return handleAddStock(req, variantId);
}