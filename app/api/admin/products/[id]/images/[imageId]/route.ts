// app/api/admin/products/[id]/images/[imageId]/route.ts
import { NextRequest } from "next/server";
import { handleDeleteImage } from "@/lib/products/handler";

// DELETE /api/admin/products/[id]/images/[imageId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;
  return handleDeleteImage(req, id, imageId);
}