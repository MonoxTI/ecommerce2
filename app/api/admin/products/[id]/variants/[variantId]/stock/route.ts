// app/api/admin/products/[id]/variants/[variantId]/stock/route.ts
import { NextRequest } from "next/server";
import { handleUpdateStock } from "@/lib/products/handler";

// PATCH /api/admin/products/[id]/variants/[variantId]/stock
// Body: { "stock": 25 }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  return handleUpdateStock(req, id, variantId);
}