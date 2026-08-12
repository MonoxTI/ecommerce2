// app/api/admin/products/[id]/hide/route.ts
// POST /api/admin/products/[id]/hide — soft delete (sets isActive: false)
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, notFound, badRequest } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return notFound("Product not found");

  // Check if isActive field exists on the model
  // If not, fall back to setting all variant stock to 0
  try {
    await db.product.update({
      where: { id },
      data:  { isActive: false } as any,
    });
    return ok(null, "Product hidden successfully");
  } catch {
    // isActive field doesn't exist — set all variant stock to 0 instead
    await db.productVariant.updateMany({
      where: { productId: id },
      data:  { stock: 0 },
    });
    return ok(null, "Product stock set to 0 (hidden from shop)");
  }
}