// app/api/services/availability/days/route.ts
// Returns which days of week AND specific dates the admin has availability set
import { db } from "@/lib/DB/prisma";
import { ok } from "@/lib/api/response";

export async function GET() {
  try {
    const availability = await (db as any).availability.findMany({
      where:  { active: true },
      select: { dayOfWeek: true, specificDate: true },
    });
    // Return both recurring day numbers and specific dates
    const days  = [...new Set(availability.filter((a: any) => a.dayOfWeek !== null).map((a: any) => a.dayOfWeek))];
    const dates = availability.filter((a: any) => a.specificDate).map((a: any) => a.specificDate);
    return ok({ days, dates });
  } catch {
    return ok({ days: [], dates: [] });
  }
}