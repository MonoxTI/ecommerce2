// app/api/addresses/[id]/route.ts
import { NextRequest } from "next/server";
import { handleUpdateAddress, handleDeleteAddress } from "@/lib/addresses/handlers";

// PATCH  /api/addresses/[id]  → update address fields
// DELETE /api/addresses/[id]  → delete address
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateAddress(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteAddress(req, id);
}