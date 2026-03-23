// lib/addresses/handlers.ts

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, created, notFound, forbidden, badRequest, validationError } from "@/lib/api/response";
import { AddressSchema } from "@/lib/validation/schemas";
import { z } from "zod";

// ─── LIST ADDRESSES ──────────────────────────────────────────
// GET /api/addresses

export async function handleListAddresses(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return notFound("Unauthorized");

  const addresses = await db.address.findMany({
    where:   { userId: user.sub },
    orderBy: { createdAt: "desc" },
  });

  return ok(addresses);
}

// ─── CREATE ADDRESS ──────────────────────────────────────────
// POST /api/addresses

export async function handleCreateAddress(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return notFound("Unauthorized");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = AddressSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const address = await db.address.create({
    data: { ...parsed.data, userId: user.sub },
  });

  return created(address, "Address added");
}

// ─── UPDATE ADDRESS ──────────────────────────────────────────
// PATCH /api/addresses/[id]

export async function handleUpdateAddress(req: NextRequest, id: string) {
  const user = await getCurrentUser(req);
  if (!user) return notFound("Unauthorized");

  const address = await db.address.findFirst({
    where: { id, userId: user.sub },
  });
  if (!address) return notFound("Address not found");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = AddressSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const updated = await db.address.update({
    where: { id },
    data:  parsed.data,
  });

  return ok(updated, "Address updated");
}

// ─── DELETE ADDRESS ──────────────────────────────────────────
// DELETE /api/addresses/[id]

export async function handleDeleteAddress(req: NextRequest, id: string) {
  const user = await getCurrentUser(req);
  if (!user) return notFound("Unauthorized");

  const address = await db.address.findFirst({
    where: { id, userId: user.sub },
  });
  if (!address) return notFound("Address not found");

  // Check if address is used in any active orders
  const activeOrder = await db.order.findFirst({
    where: {
      addressId: id,
      status:    { in: ["PENDING", "PAID", "SHIPPED"] },
    },
  });

  if (activeOrder) {
    return badRequest("Cannot delete an address that is used in an active order");
  }

  await db.address.delete({ where: { id } });
  return ok(null, "Address deleted");
}