// app/api/admin/stats/route.ts

import { NextRequest } from "next/server";
import { handleAdminStats } from "@/lib/orders/handlers";

// GET /api/admin/stats  → dashboard metrics
// Returns: order counts, revenue (in rands), customer count, low stock alerts

export async function GET(req: NextRequest) {
  return handleAdminStats(req);
}