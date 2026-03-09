// app/api/admin/customers/route.ts
import { NextRequest } from "next/server";
import { handleListCustomers } from "@/lib/admin/customers.handlers";

// GET /api/admin/customers  → paginated customer list
// Query: page, limit, search
export async function GET(req: NextRequest) {
  return handleListCustomers(req);
}