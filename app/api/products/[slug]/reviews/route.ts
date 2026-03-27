// app/api/products/[slug]/reviews/route.ts
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/JWT";
import { unauthorized, badRequest } from "@/lib/api/response";
import { getReviewsHandler, createReviewHandler } from "@/lib/products/handler";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return getReviewsHandler(slug);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { slug } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  return createReviewHandler(user.sub, slug, body);
}