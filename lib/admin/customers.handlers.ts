// lib/admin/customers.handlers.ts

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok, notFound, badRequest, paginate } from "@/lib/api/response";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { Role } from "@prisma/client";
import { z } from "zod";

// ─── LIST CUSTOMERS ──────────────────────────────────────────
// GET /api/admin/customers
// Query: page, limit, search (name or email)

export async function handleListCustomers(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const search = searchParams.get("search");

  const where: any = { role: Role.CUSTOMER };
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const [total, customers] = await db.$transaction([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      select: {
        id:        true,
        name:      true,
        email:     true,
        phone:     true,
        isActive:  true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
    }),
  ]);

  return ok({ items: customers, meta: paginate(total, page, limit) });
}

// ─── GET SINGLE CUSTOMER ─────────────────────────────────────
// GET /api/admin/customers/[id]
// Full customer detail with order history.

export async function handleGetCustomer(req: NextRequest, id: string) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const customer = await db.user.findFirst({
    where:  { id, role: Role.CUSTOMER },
    select: {
      id:        true,
      name:      true,
      email:     true,
      phone:     true,
      isActive:  true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take:    10,
        select: {
          id:        true,
          status:    true,
          total:     true,
          createdAt: true,
          payment:   { select: { status: true } },
        },
      },
      _count: {
        select: { orders: true, reviews: true },
      },
    },
  });

  if (!customer) return notFound("Customer not found");

  // Calculate lifetime value
  const ltv = await db.payment.aggregate({
    _sum:  { amount: true },
    where: { order: { userId: id }, status: "SUCCESS" },
  });

  return ok({
    ...customer,
    lifetimeValue:      (ltv._sum.amount ?? 0) / 100, // rands
    orders: customer.orders.map((o) => ({
      ...o,
      totalRands: o.total / 100,
    })),
  });
}

// ─── TOGGLE CUSTOMER ACTIVE ──────────────────────────────────
// PATCH /api/admin/customers/[id]
// Body: { isActive: false }  → deactivate (blocks login)

export async function handleToggleCustomer(req: NextRequest, id: string) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json().catch(() => null);
  const parsed = z.object({
    isActive: z.boolean(),
  }).safeParse(body);

  if (!parsed.success) return badRequest("isActive (boolean) is required");

  const customer = await db.user.findFirst({
    where: { id, role: Role.CUSTOMER },
  });
  if (!customer) return notFound("Customer not found");

  const updated = await db.user.update({
    where: { id },
    data:  { isActive: parsed.data.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });

  // If deactivating — revoke all their sessions
  if (!parsed.data.isActive) {
    await db.refreshToken.updateMany({
      where: { userId: id },
      data:  { revoked: true },
    });
  }

  return ok(
    updated,
    parsed.data.isActive ? "Customer account activated" : "Customer account deactivated"
  );
}