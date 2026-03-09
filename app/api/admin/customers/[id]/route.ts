// app/api/admin/customers/[id]/route.ts
import { NextRequest } from "next/server";
import { handleGetCustomer, handleToggleCustomer } from "@/lib/admin/customers.handlers";

// GET   /api/admin/customers/[id]  → full customer detail + order history
// PATCH /api/admin/customers/[id]  → activate/deactivate  { isActive: bool }
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetCustomer(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleToggleCustomer(req, id);
}