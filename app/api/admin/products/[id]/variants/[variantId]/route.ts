// app/api/admin/products/[id]/variants/[variantId]/route.ts
import { NextRequest } from "next/server";
import { handleUpdateVariant } from "@/lib/products/handler";

// PATCH /api/admin/products/[id]/variants/[variantId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  return handleUpdateVariant(req, id, variantId);
}