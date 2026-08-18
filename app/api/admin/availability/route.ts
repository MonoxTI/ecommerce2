// app/api/admin/availability/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, created, badRequest } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;

  try {
    const availability = await (db as any).availability.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { specificDate: "asc" }],
    });
    return ok(availability);
  } catch (err: any) {
    // Schema not pushed yet — return empty list with helpful message
    console.error("[Availability GET]", err.message);
    return ok([]);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;

  const body = await req.json().catch(() => null);
  if (!body?.startTime || !body?.endTime) {
    return badRequest("startTime and endTime are required");
  }

  // Must have either dayOfWeek or specificDate
  if (body.dayOfWeek === null && !body.specificDate) {
    return badRequest("Either dayOfWeek or specificDate is required");
  }

  try {
    const slot = await (db as any).availability.create({
      data: {
        dayOfWeek:    body.dayOfWeek ?? null,
        specificDate: body.specificDate ?? null,
        startTime:    body.startTime,
        endTime:      body.endTime,
        active:       body.active ?? true,
      },
    });
    return created(slot, "Availability added");
  } catch (err: any) {
    console.error("[Availability POST]", err.message);
    if (err.message?.includes("Unknown argument")) {
      return badRequest("Database schema is outdated. Run: npx prisma db push");
    }
    return badRequest(err.message ?? "Failed to create availability");
  }
}