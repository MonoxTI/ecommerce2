// app/api/orders/route.ts

import { NextRequest } from "next/server";
import { handleGetMyOrders, handleCheckout } from "@/lib/orders/handlers";

// GET  /api/orders  → paginated order history for logged-in user
// POST /api/orders  → checkout: create order from cart
//                    Body: { addressId, couponCode?, notes? }

export async function GET(req: NextRequest) {
  return handleGetMyOrders(req);
}

export async function POST(req: NextRequest) {
  return handleCheckout(req);
}