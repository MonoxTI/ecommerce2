// app/api/products/[slug]/reviews/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, created, badRequest, unauthorized, conflict, validationError } from "@/lib/api/response";
import { ReviewSchema } from "@/lib/validation/schemas";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return badRequest("Product not found");
  const reviews = await db.review.findMany({
    where:   { productId: product.id, verified: true },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
  return ok(reviews);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return badRequest("Product not found");
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  const existing = await db.review.findFirst({
    where: { userId: user.sub, productId: product.id },
  });
  if (existing) return conflict("You have already reviewed this product");
  const purchased = await db.order.findFirst({
    where: {
      userId: user.sub,
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      items:  { some: { variant: { productId: product.id } } },
    },
  });
  const review = await db.review.create({
    data: {
      userId:    user.sub,
      productId: product.id,
      rating:    parsed.data.rating,
      comment:   parsed.data.comment,
      verified:  !!purchased,
    },
    include: { user: { select: { name: true } } },
  });
  return created(review, "Review submitted successfully");
}