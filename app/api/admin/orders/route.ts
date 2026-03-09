// app/api/admin/orders/route.ts

import { NextRequest } from "next/server";
import { handleAdminGetOrders } from "@/lib/orders/handlers";

// GET /api/admin/orders
// Query params: page, limit, status, search (customer email)

export async function GET(req: NextRequest) {
  return handleAdminGetOrders(req);
}