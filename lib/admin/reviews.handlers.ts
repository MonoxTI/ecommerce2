// lib/admin/reviews.handlers.ts
// Admin review moderation.
// Reviews are marked verified=false by default until admin approves.

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok, notFound, badRequest, paginate } from "@/lib/api/response";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { z } from "zod";

// ─── LIST REVIEWS ────────────────────────────────────────────
// GET /api/admin/reviews
// Query: verified (bool), page, limit

export async function handleListReviews(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit    = Math.min(50, Number(searchParams.get("limit") ?? 20));
  const verified = searchParams.get("verified");

  const where: any = {};
  if (verified !== null) {
    where.verified = verified === "true";
  }

  const [total, reviews] = await db.$transaction([
    db.review.count({ where }),
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        user:    { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  return ok({ items: reviews, meta: paginate(total, page, limit) });
}

// ─── MODERATE REVIEW ─────────────────────────────────────────
// PATCH /api/admin/reviews/[id]
// Body: { action: "approve" | "reject" }
// approve → marks verified=true
// reject  → deletes the review

export async function handleModerateReview(req: NextRequest, id: string) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const body = await req.json().catch(() => null);
  const parsed = z.object({
    action: z.enum(["approve", "reject"]),
  }).safeParse(body);

  if (!parsed.success) return badRequest('action must be "approve" or "reject"');

  const review = await db.review.findUnique({ where: { id } });
  if (!review) return notFound("Review not found");

  if (parsed.data.action === "approve") {
    const updated = await db.review.update({
      where: { id },
      data:  { verified: true },
    });
    return ok(updated, "Review approved and published");
  } else {
    await db.review.delete({ where: { id } });
    return ok(null, "Review rejected and deleted");
  }
}