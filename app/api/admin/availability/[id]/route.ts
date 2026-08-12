// app/api/admin/availability/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok } from "@/lib/api/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const slot = await (db as any).availability.update({ where: { id }, data: body });
  return ok(slot, "Availability updated");
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  await (db as any).availability.delete({ where: { id } });
  return ok(null, "Availability deleted");
}