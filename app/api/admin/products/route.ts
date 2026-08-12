// app/api/admin/products/route.ts
import { NextRequest } from "next/server";
import { handleGetAllProducts, handleCreateProduct } from "@/lib/products/handler";

// GET /api/admin/products — returns ALL products including hidden (admin only)
export async function GET(req: NextRequest) {
  return handleGetAllProducts(req);
}

// POST /api/admin/products — create a new product
export async function POST(req: NextRequest) {
  return handleCreateProduct(req);
}