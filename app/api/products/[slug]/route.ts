// app/api/products/[slug]/route.ts
import { NextRequest } from "next/server";
import { handleGetProduct } from "@/lib/products/handler";

// GET /api/products/body-wave-lace-front-wig
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleGetProduct(req, slug);
}