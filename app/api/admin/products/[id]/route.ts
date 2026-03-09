// app/api/admin/products/[id]/route.ts
import { NextRequest } from "next/server";
import {
  handleUpdateProduct,
  handleDeleteProduct,
} from "@/lib/products/handler";

// PATCH  /api/admin/products/[id] - update product fields
// DELETE /api/admin/products/[id] - delete (or zero stock if has orders)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateProduct(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteProduct(req, id);
}