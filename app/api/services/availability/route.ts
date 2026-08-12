// app/api/services/availability/route.ts
// GET /api/services/availability?date=2026-06-15&serviceId=xxx
// Returns available time slots for a given date and service
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok, badRequest } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date      = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) return badRequest("date and serviceId are required");

  try {
    // Get day of week (0=Sun...6=Sat)
    const dayOfWeek = new Date(date).getDay();

    // Get admin availability for this day
    const availability = await (db as any).availability.findFirst({
      where: { dayOfWeek, active: true },
    });

    if (!availability) return ok([]); // No availability set for this day

    // Get service duration
    const service = await (db as any).service.findUnique({ where: { id: serviceId } });
    if (!service) return badRequest("Service not found");

    // Get already booked slots for this date
    const booked = await (db as any).appointment.findMany({
      where: { date, status: { not: "CANCELLED" } },
      select: { startTime: true, endTime: true },
    });

    // Generate 30-minute slots within availability window
    const [startH, startM] = availability.startTime.split(":").map(Number);
    const [endH,   endM  ] = availability.endTime.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal   = endH   * 60 + endM;

    const slots: string[] = [];
    for (let t = startTotal; t + service.duration <= endTotal; t += 30) {
      const slotStart = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      const slotEnd   = t + service.duration;
      const slotEndStr = `${String(Math.floor(slotEnd / 60)).padStart(2, "0")}:${String(slotEnd % 60).padStart(2, "0")}`;

      // Check if slot overlaps with any booked appointment
      const isBooked = booked.some((b: any) => {
        return slotStart < b.endTime && slotEndStr > b.startTime;
      });

      if (!isBooked) slots.push(slotStart);
    }

    return ok(slots);
  } catch { return ok([]); }
}