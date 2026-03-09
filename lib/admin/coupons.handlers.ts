// lib/admin/coupons.handlers.ts

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok, created, notFound, conflict, badRequest, validationError, paginate } from "@/lib/api/response";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { CouponSchema } from "@/lib/validation/schemas";
import { z } from "zod";

// ─── LIST COUPONS ────────────────────────────────────────────
// GET /api/admin/coupons

export async function handleListCoupons(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit  = Math.min(50, Number(searchParams.get("limit") ?? 20));
  const active = searchParams.get("active");

  const where: any = {};
  if (active !== null) where.active = active === "true";

  const [total, coupons] = await db.$transaction([
    db.coupon.count({ where }),
    db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
  ]);

  return ok({
    items: coupons.map((c) => ({
      ...c,
      // Add human-readable discount display
      discountDisplay:
        c.type === "PERCENTAGE"
          ? `${c.discount}% off`
          : `R${(c.discount / 100).toFixed(2)} off`,
      minOrderRands: c.minOrder ? c.minOrder / 100 : null,
      isExpired:     c.expiresAt ? c.expiresAt < new Date() : false,
      usageDisplay:  c.maxUses ? `${c.usedCount} / ${c.maxUses}` : `${c.usedCount} uses`,
    })),
    meta: paginate(total, page, limit),
  });
}

// ─── CREATE COUPON ───────────────────────────────────────────
// POST /api/admin/coupons

export async function handleCreateCoupon(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = CouponSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await db.coupon.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) return conflict(`Coupon code "${parsed.data.code}" already exists`);

  const coupon = await db.coupon.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  return created(coupon, "Coupon created successfully");
}

// ─── UPDATE COUPON ───────────────────────────────────────────
// PATCH /api/admin/coupons/[id]

export async function handleUpdateCoupon(req: NextRequest, id: string) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = CouponSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) return notFound("Coupon not found");

  const updated = await db.coupon.update({
    where: { id },
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  });

  return ok(updated, "Coupon updated");
}

// ─── DELETE COUPON ───────────────────────────────────────────
// DELETE /api/admin/coupons/[id]

export async function handleDeleteCoupon(req: NextRequest, id: string) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) return notFound("Coupon not found");

  await db.coupon.delete({ where: { id } });
  return ok(null, "Coupon deleted");
}

// ─── VALIDATE COUPON (for checkout preview) ──────────────────
// POST /api/admin/coupons/validate
// Body: { code, orderTotal }  — returns discount amount

export async function handleValidateCoupon(req: NextRequest) {
  // This one is public — called from the checkout page
  const body = await req.json().catch(() => null);
  const parsed = z.object({
    code:       z.string().min(1),
    orderTotal: z.number().int().positive(), // in cents
  }).safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const { code, orderTotal } = parsed.data;

  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.active) {
    return badRequest("Invalid coupon code");
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return badRequest("This coupon has expired");
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return badRequest("This coupon has reached its usage limit");
  }
  if (coupon.minOrder && orderTotal < coupon.minOrder) {
    return badRequest(
      `Minimum order of R${(coupon.minOrder / 100).toFixed(2)} required`
    );
  }

  const discountAmount =
    coupon.type === "PERCENTAGE"
      ? Math.round((orderTotal * coupon.discount) / 100)
      : Math.min(coupon.discount, orderTotal);

  return ok({
    code:            coupon.code,
    discountAmount,               // cents
    discountRands:   discountAmount / 100,
    discountDisplay:
      coupon.type === "PERCENTAGE"
        ? `${coupon.discount}% off`
        : `R${(coupon.discount / 100).toFixed(2)} off`,
  });
}