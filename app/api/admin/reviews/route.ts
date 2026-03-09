// app/api/admin/reviews/route.ts
import { NextRequest } from "next/server";
import { handleListReviews } from "@/lib/admin/reviews.handlers";

// GET /api/admin/reviews
// Query: verified (bool), page, limit
export async function GET(req: NextRequest) {
  return handleListReviews(req);
}