// app/api/product-filters/route.ts
// GET /api/product-filters — the filter options that actually exist in the shop
// (lengths and lace types of in-stock variants of visible products).
import { db } from "@/lib/DB/prisma";
import { ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

function uniqueSorted(values: (string | null)[], numeric: boolean): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const t = v?.trim();
    if (t) set.add(t);
  }
  const arr = [...set];
  return numeric
    ? arr.sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b))
    : arr.sort((a, b) => a.localeCompare(b));
}

export async function GET() {
  const variants = await db.productVariant.findMany({
    where:  { stock: { gt: 0 }, product: { isActive: true } },
    select: { length: true, laceType: true },
  });

  return ok({
    lengths:   uniqueSorted(variants.map(v => v.length),   true),
    laceTypes: uniqueSorted(variants.map(v => v.laceType), false),
  });
}