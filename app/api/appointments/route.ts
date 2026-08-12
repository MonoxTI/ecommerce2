// app/api/appointments/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, created, badRequest, unauthorized } from "@/lib/api/response";

// GET /api/appointments — customer's own appointments
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  const appointments = await (db as any).appointment.findMany({
    where: { userId: user.sub },
    include: { service: true },
    orderBy: { date: "desc" },
  });
  return ok(appointments);
}

// POST /api/appointments — book an appointment
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body?.serviceId || !body?.date || !body?.startTime) {
    return badRequest("serviceId, date and startTime are required");
  }
  // Check slot is not already taken
  const existing = await (db as any).appointment.findFirst({
    where: { date: body.date, startTime: body.startTime, status: { not: "CANCELLED" } },
  });
  if (existing) return badRequest("This time slot is already booked. Please choose another.");

  const service = await (db as any).service.findUnique({ where: { id: body.serviceId } });
  if (!service) return badRequest("Service not found");

  // Calculate end time
  const [h, m] = body.startTime.split(":").map(Number);
  const endMinutes = h * 60 + m + service.duration;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

  const appointment = await (db as any).appointment.create({
    data: {
      serviceId: body.serviceId,
      userId:    user.sub,
      date:      body.date,
      startTime: body.startTime,
      endTime,
      notes:     body.notes ?? null,
      status:    "PENDING",
    },
    include: { service: true },
  });
  return created(appointment, "Appointment booked successfully");
}