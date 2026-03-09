// app/api/categories/[id]/route.ts
import { NextRequest } from "next/server";
import { handleUpdateCategory } from "@/lib/products/handler";

// PATCH /api/categories/[id] - admin only
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateCategory(req, id);
}