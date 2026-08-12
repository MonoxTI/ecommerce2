// app/api/admin/appointments/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok } from "@/lib/api/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const appt = await (db as any).appointment.update({
    where: { id },
    data:  { status: body.status },
    include: { service: true, user: { select: { name: true, email: true } } },
  });
  return ok(appt, "Appointment updated");
}