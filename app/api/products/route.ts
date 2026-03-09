// app/api/products/route.ts
import { NextRequest } from "next/server";
import { handleGetProducts } from "@/lib/products/handler";

// GET /api/products
// Public. Query params: page, limit, category, search, minPrice, maxPrice,
//                       color, length, laceType, sortBy
export async function GET(req: NextRequest) {
  return handleGetProducts(req);
}