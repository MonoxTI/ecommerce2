// app/api/admin/availability/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, badRequest } from "@/lib/api/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  try {
    const slot = await (db as any).availability.update({ where: { id }, data: body });
    return ok(slot, "Availability updated");
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to update");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  try {
    await (db as any).availability.delete({ where: { id } });
    return ok(null, "Availability deleted");
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to delete");
  }
}