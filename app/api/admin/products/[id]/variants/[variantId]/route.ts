// app/api/admin/products/[id]/variants/[variantId]/route.ts
import { NextRequest } from "next/server";
import { handleUpdateVariant, handleDeleteVariant } from "@/lib/products/handler";

// PATCH /api/admin/products/[id]/variants/[variantId] — update variant fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  return handleUpdateVariant(req, id, variantId);
}

// DELETE /api/admin/products/[id]/variants/[variantId] — delete variant
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  return handleDeleteVariant(req, id, variantId);
}