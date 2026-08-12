// app/api/services/availability/days/route.ts
// GET /api/services/availability/days
// Returns which days of the week the admin has active availability set
// e.g. [1, 2, 3, 4, 5] means Mon–Fri

import { db } from "@/lib/DB/prisma";
import { ok } from "@/lib/api/response";

export async function GET() {
  try {
    const availability = await (db as any).availability.findMany({
      where:  { active: true },
      select: { dayOfWeek: true },
    });
    const days = [...new Set(availability.map((a: any) => a.dayOfWeek))];
    return ok(days);
  } catch {
    return ok([]);
  }
}