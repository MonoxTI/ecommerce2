// app/api/admin/appointments/new/route.ts
// GET  → { count } of paid bookings the admin has not seen yet (sidebar badge)
// POST → mark bookings as seen. Body: { ids?: string[] } (omit ids = mark all)
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const count = await (db as any).appointment.count({ where: { depositPaid: true, adminSeen: false } });
  return ok({ count });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === "string") : null;
  const r = await (db as any).appointment.updateMany({
    where: { depositPaid: true, adminSeen: false, ...(ids ? { id: { in: ids } } : {}) },
    data:  { adminSeen: true },
  });
  return ok({ updated: r.count });
}