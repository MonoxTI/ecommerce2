// app/api/admin/products/[id]/variants/route.ts
import { NextRequest } from "next/server";
import { handleAddVariant } from "@/lib/products/handler";

// POST /api/admin/products/[id]/variants - add a new variant to a product
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleAddVariant(req, id);
}