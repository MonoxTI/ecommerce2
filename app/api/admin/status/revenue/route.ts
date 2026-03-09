// app/api/admin/stats/revenue/route.ts
import { NextRequest } from "next/server";
import { handleRevenueChart } from "@/lib/admin/stats.handlers";

// GET /api/admin/stats/revenue  → 30-day daily revenue chart data
export async function GET(req: NextRequest) {
  return handleRevenueChart(req);
}