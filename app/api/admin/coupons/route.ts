// app/api/admin/coupons/route.ts
import { NextRequest } from "next/server";
import { handleListCoupons, handleCreateCoupon } from "@/lib/admin/coupons.handlers";

// GET  /api/admin/coupons  → list all coupons
// POST /api/admin/coupons  → create a coupon
export async function GET(req: NextRequest) {
  return handleListCoupons(req);
}

export async function POST(req: NextRequest) {
  return handleCreateCoupon(req);
}