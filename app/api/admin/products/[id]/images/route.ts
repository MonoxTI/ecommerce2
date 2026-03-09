// app/api/admin/products/[id]/images/route.ts
import { NextRequest } from "next/server";
import { handleAddImage } from "@/lib/products/handler";

// POST /api/admin/products/[id]/images
// Body: { "url": "https://..." }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleAddImage(req, id);
}