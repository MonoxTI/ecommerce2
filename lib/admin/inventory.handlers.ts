// lib/admin/inventory.handlers.ts

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok, notFound, badRequest, paginate } from "@/lib/api/response";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { z } from "zod";

// ─── INVENTORY REPORT ────────────────────────────────────────
// GET /api/admin/inventory

export async function handleInventory(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const page           = Math.max(1, Number(searchParams.get("page")    ?? 1));
  const limit          = Math.min(100, Number(searchParams.get("limit") ?? 50));
  const threshold      = Number(searchParams.get("threshold")           ?? 10);
  const outOfStockOnly = searchParams.get("outOfStock") === "true";

  const stockFilter = outOfStockOnly
    ? { stock: 0 }
    : { stock: { lte: threshold } };

  const [total, variants] = await db.$transaction([
    db.productVariant.count({ where: stockFilter }),
    db.productVariant.findMany({
      where:   stockFilter,
      orderBy: { stock: "asc" },
      skip:    (page - 1) * limit,
      take:    limit,
      select: {
        id: true, sku: true, stock: true, price: true,
        color: true, length: true, laceType: true, capSize: true,
        product: {
          select: {
            id: true, name: true, slug: true,
            images: { select: { url: true }, take: 1 },
          },
        },
      },
    }),
  ]);

  return ok({
    items: variants.map((v) => ({
      ...v,
      priceRands:  v.price / 100,
      stockStatus:
        v.stock === 0 ? "OUT_OF_STOCK" :
        v.stock <= 5  ? "CRITICAL" :
        v.stock <= 10 ? "LOW" : "OK",
    })),
    meta: paginate(total, page, limit),
    summary: {
      total,
      outOfStock: variants.filter((v) => v.stock === 0).length,
      critical:   variants.filter((v) => v.stock > 0 && v.stock <= 5).length,
      low:        variants.filter((v) => v.stock > 5 && v.stock <= 10).length,
    },
  });
}

// ─── ADD STOCK ───────────────────────────────────────────────
// PATCH /api/admin/inventory/[variantId]
// Body: { quantity: 50 }             → adds 50 to current stock
// Body: { quantity: 50, set: true }  → sets stock to exactly 50

export async function handleAddStock(req: NextRequest, variantId: string) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json().catch(() => null);

  const parsed = z.object({
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    set:      z.boolean().optional().default(false), // true = set to, false = add to
  }).safeParse(body);

  if (!parsed.success) return badRequest(parsed.error.errors[0].message);

  const { quantity, set } = parsed.data;

  const variant = await db.productVariant.findUnique({
    where:  { id: variantId },
    select: { id: true, sku: true, stock: true, product: { select: { name: true } } },
  });

  if (!variant) return notFound("Variant not found");

  const previousStock = variant.stock;

  const updated = await db.productVariant.update({
    where: { id: variantId },
    data:  { stock: set ? quantity : { increment: quantity } },
    select: {
      id: true, sku: true, stock: true, price: true,
      color: true, length: true, laceType: true, capSize: true,
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  return ok({
    ...updated,
    previousStock,
    stockAdded:   set ? quantity - previousStock : quantity,
    stockStatus:
      updated.stock === 0 ? "OUT_OF_STOCK" :
      updated.stock <= 5  ? "CRITICAL" :
      updated.stock <= 10 ? "LOW" : "OK",
  }, set
    ? `Stock set to ${quantity} (was ${previousStock})`
    : `Added ${quantity} units — new stock: ${updated.stock}`
  );
}