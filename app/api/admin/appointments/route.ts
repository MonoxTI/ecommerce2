// app/api/admin/appointments/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok } from "@/lib/api/response";
import { expireStaleHolds } from "@/lib/appointments/holds";

export async function GET(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  await expireStaleHolds();
  const { searchParams } = new URL(req.url);
  const date   = searchParams.get("date");
  const status = searchParams.get("status");
  const where: any = {};
  if (date) where.date = date;
  // Default view hides unpaid holds and expired ones; ask for them by status if needed
  where.status = status ? status : { notIn: ["AWAITING_PAYMENT", "EXPIRED"] };
  const appointments = await (db as any).appointment.findMany({
    where,
    include: {
      service: true,
      user:    { select: { name: true, email: true, phone: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return ok(appointments);
}