// app/api/admin/products/[id]/hide/route.ts
// POST /api/admin/products/[id]/hide — soft delete (sets isActive: false)
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

  await db.product.update({
    where: { id },
    data:  { isActive: false },
  });

  return ok(null, "Product hidden successfully");
}