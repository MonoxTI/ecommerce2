// app/api/admin/services/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, notFound, badRequest } from "@/lib/api/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const service = await (db as any).service.update({ where: { id }, data: body });
  return ok(service, "Service updated");
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;

  // Check if service has any appointments
  const appointmentCount = await (db as any).appointment.count({ where: { serviceId: id } });

  if (appointmentCount > 0) {
    // Has appointments — soft delete by setting active: false instead
    await (db as any).service.update({ where: { id }, data: { active: false } });
    return ok(null, `Service hidden — it has ${appointmentCount} appointment(s) so it cannot be permanently deleted.`);
  }

  // No appointments — safe to hard delete
  await (db as any).service.delete({ where: { id } });
  return ok(null, "Service deleted");
}