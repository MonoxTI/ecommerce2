// lib/admin/inventory.handlers.ts

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok, paginate } from "@/lib/api/response";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";

// ─── INVENTORY REPORT ────────────────────────────────────────
// GET /api/admin/inventory
// Lists all variants with stock levels.
// Query: threshold (default 10 = show variants with stock <= 10)
//        outOfStock (bool) = only show 0 stock

export async function handleInventory(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const page        = Math.max(1, Number(searchParams.get("page")      ?? 1));
  const limit       = Math.min(100, Number(searchParams.get("limit")   ?? 50));
  const threshold   = Number(searchParams.get("threshold")             ?? 10);
  const outOfStockOnly = searchParams.get("outOfStock") === "true";

  const stockFilter = outOfStockOnly
    ? { stock: 0 }
    : { stock: { lte: threshold } };

  const [total, variants] = await db.$transaction([
    db.productVariant.count({ where: stockFilter }),
    db.productVariant.findMany({
      where:   stockFilter,
      orderBy: { stock: "asc" }, // lowest stock first
      skip:    (page - 1) * limit,
      take:    limit,
      select: {
        id:       true,
        sku:      true,
        stock:    true,
        price:    true,
        color:    true,
        length:   true,
        laceType: true,
        capSize:  true,
        product: {
          select: {
            id:   true,
            name: true,
            slug: true,
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