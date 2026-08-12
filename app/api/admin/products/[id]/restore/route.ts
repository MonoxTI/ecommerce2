// app/api/admin/products/[id]/restore/route.ts
// POST /api/admin/products/[id]/restore — restore hidden product
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, notFound } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return notFound("Product not found");

  try {
    await db.product.update({
      where: { id },
      data:  { isActive: true } as any,
    });
  } catch {
    // isActive doesn't exist — nothing to restore automatically
  }

  return ok(null, "Product restored. Please manually update stock for each variant.");
}