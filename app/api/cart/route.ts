// app/api/cart/route.ts

import { NextRequest } from "next/server";
import {
  handleGetCart,
  handleAddToCart,
  handleClearCart,
} from "@/lib/cart/handlers";

// GET    /api/cart  → get current cart with totals
// POST   /api/cart  → add item  { variantId, quantity }
// DELETE /api/cart  → clear all items

export async function GET(req: NextRequest) {
  return handleGetCart(req);
}

export async function POST(req: NextRequest) {
  return handleAddToCart(req);
}

export async function DELETE(req: NextRequest) {
  return handleClearCart(req);
}