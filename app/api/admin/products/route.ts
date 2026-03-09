// app/api/admin/products/route.ts
import { NextRequest } from "next/server";
import { handleGetProducts, handleCreateProduct } from "@/lib/products/handler";

// GET  /api/admin/products  - same as public but admin can see all products
// POST /api/admin/products  - create a new product
export async function GET(req: NextRequest) {
  return handleGetProducts(req);
}

export async function POST(req: NextRequest) {
  return handleCreateProduct(req);
}