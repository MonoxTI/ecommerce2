// app/api/cart/[itemId]/route.ts

import { NextRequest } from "next/server";
import {
  handleUpdateCartItem,
  handleRemoveCartItem,
} from "@/lib/cart/handlers";

// PATCH  /api/cart/[itemId]  → update quantity  { quantity: 3 }
//                              quantity 0 = removes the item
// DELETE /api/cart/[itemId]  → remove item

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  return handleUpdateCartItem(req, itemId);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  return handleRemoveCartItem(req, itemId);
}