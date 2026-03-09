// app/api/categories/route.ts
import { NextRequest } from "next/server";
import { handleGetCategories, handleCreateCategory } from "@/lib/products/handler";

// GET  /api/categories - public, lists all categories with product count
// POST /api/categories - admin only, creates a category
export async function GET(req: NextRequest) {
  return handleGetCategories(req);
}

export async function POST(req: NextRequest) {
  return handleCreateCategory(req);
}