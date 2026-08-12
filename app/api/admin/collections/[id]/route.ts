// app/api/admin/collections/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, notFound, badRequest } from "@/lib/api/response";

// PATCH /api/admin/collections/[id] — update collection
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid body");
  const collection = await (db as any).homeCollection.update({
    where: { id },
    data: {
      ...(body.title    !== undefined && { title:    body.title }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
      ...(body.href     !== undefined && { href:     body.href }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.order    !== undefined && { order:    body.order }),
      ...(body.active   !== undefined && { active:   body.active }),
    },
  });
  return ok(collection, "Collection updated");
}

// DELETE /api/admin/collections/[id] — delete collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  await (db as any).homeCollection.delete({ where: { id } });
  return ok(null, "Collection deleted");
}