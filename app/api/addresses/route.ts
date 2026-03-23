// app/api/addresses/route.ts
import { NextRequest } from "next/server";
import { handleListAddresses, handleCreateAddress } from "@/lib/addresses/handlers";

// GET  /api/addresses  → list all addresses for logged-in user
// POST /api/addresses  → create a new address
export async function GET(req: NextRequest) {
  return handleListAddresses(req);
}

export async function POST(req: NextRequest) {
  return handleCreateAddress(req);
}