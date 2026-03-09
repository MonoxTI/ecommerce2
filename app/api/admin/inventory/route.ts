// app/api/admin/inventory/route.ts
import { NextRequest } from "next/server";
import { handleInventory } from "@/lib/admin/inventory.handlers";

// GET /api/admin/inventory
// Query: threshold (default 10), outOfStock (bool), page, limit
// Returns variants with low/zero stock sorted by stock level ascending
export async function GET(req: NextRequest) {
  return handleInventory(req);
}