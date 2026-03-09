// app/api/admin/coupons/[id]/route.ts
import { NextRequest } from "next/server";
import { handleUpdateCoupon, handleDeleteCoupon } from "@/lib/admin/coupons.handlers";

// PATCH  /api/admin/coupons/[id]  → update coupon
// DELETE /api/admin/coupons/[id]  → delete coupon
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateCoupon(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteCoupon(req, id);
}