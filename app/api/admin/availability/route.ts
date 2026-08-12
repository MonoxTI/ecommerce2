// app/api/admin/availability/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, created } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const availability = await (db as any).availability.findMany({ orderBy: { dayOfWeek: "asc" } });
  return ok(availability);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const body = await req.json().catch(() => null);
  const slot = await (db as any).availability.create({
    data: {
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime:   body.endTime,
      active:    body.active ?? true,
    },
  });
  return created(slot, "Availability added");
}