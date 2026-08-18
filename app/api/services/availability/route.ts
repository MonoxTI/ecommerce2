// app/api/services/availability/route.ts
// GET /api/services/availability?date=2026-06-15&serviceId=xxx
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok, badRequest } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date      = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");
  if (!date || !serviceId) return badRequest("date and serviceId are required");

  try {
    const dayOfWeek = new Date(date + "T00:00:00").getDay();

    // Find availability for this specific date OR this day of week
    const availability = await (db as any).availability.findFirst({
      where: {
        active: true,
        OR: [
          { specificDate: date },
          { dayOfWeek, specificDate: null },
        ],
      },
      // Specific date takes priority over recurring
      orderBy: { specificDate: "desc" },
    });

    if (!availability) return ok([]);

    const service = await (db as any).service.findUnique({ where: { id: serviceId } });
    if (!service) return badRequest("Service not found");

    // Get already booked slots
    const booked = await (db as any).appointment.findMany({
      where: { date, status: { not: "CANCELLED" } },
      select: { startTime: true, endTime: true },
    });

    // Generate slots
    const [startH, startM] = availability.startTime.split(":").map(Number);
    const [endH,   endM  ] = availability.endTime.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal   = endH   * 60 + endM;

    const slots: string[] = [];
    for (let t = startTotal; t + service.duration <= endTotal; t += 30) {
      const slotStart  = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      const slotEndMin = t + service.duration;
      const slotEnd    = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;

      const isBooked = booked.some((b: any) => slotStart < b.endTime && slotEnd > b.startTime);
      if (!isBooked) slots.push(slotStart);
    }

    return ok(slots);
  } catch (e) {
    console.error(e);
    return ok([]);
  }
}