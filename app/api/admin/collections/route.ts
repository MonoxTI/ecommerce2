// app/api/admin/collections/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, created, badRequest } from "@/lib/api/response";

// GET /api/admin/collections — all collections including inactive
export async function GET(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const collections = await (db as any).homeCollection.findMany({
    orderBy: { order: "asc" },
  });
  return ok(collections);
}

// POST /api/admin/collections — create new collection
export async function POST(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.imageUrl) return badRequest("title and imageUrl are required");
  const collection = await (db as any).homeCollection.create({
    data: {
      title:    body.title,
      subtitle: body.subtitle ?? "",
      href:     body.href ?? "/shop",
      imageUrl: body.imageUrl,
      order:    body.order ?? 0,
      active:   body.active ?? true,
    },
  });
  return created(collection, "Collection created");
}