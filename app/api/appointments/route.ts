// app/api/appointments/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, created, badRequest, unauthorized } from "@/lib/api/response";
import { createYocoCheckout } from "@/lib/payments/yoco";
import { blocking, depositFor, expireStaleHolds } from "@/lib/appointments/holds";

// GET /api/appointments — customer's own appointments
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  await expireStaleHolds();
  const appointments = await (db as any).appointment.findMany({
    where: { userId: user.sub, status: { not: "EXPIRED" } },
    include: { service: true },
    orderBy: { date: "desc" },
  });
  return ok(appointments);
}

// POST /api/appointments — reserve a slot and start the 50% deposit payment.
// The appointment is held as AWAITING_PAYMENT; the Yoco webhook confirms it once paid.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body?.serviceId || !body?.date || !body?.startTime) {
    return badRequest("serviceId, date and startTime are required");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date) || !/^\d{2}:\d{2}$/.test(body.startTime)) {
    return badRequest("Invalid date or time");
  }
  if (!process.env.YOCO_SECRET_KEY) return badRequest("Payments are not configured.");

  const service = await (db as any).service.findUnique({ where: { id: body.serviceId } });
  if (!service || !service.active) return badRequest("Service not found");

  // Calculate end time
  const [h, m] = body.startTime.split(":").map(Number);
  const endMinutes = h * 60 + m + service.duration;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

  // Release old unpaid holds, then make sure nothing overlaps this slot
  await expireStaleHolds();
  const clash = await (db as any).appointment.findFirst({
    where: { date: body.date, startTime: { lt: endTime }, endTime: { gt: body.startTime }, ...blocking },
  });
  if (clash) return badRequest("This time slot is already booked. Please choose another.");

  const depositAmount = depositFor(service.price);

  const appointment = await (db as any).appointment.create({
    data: {
      serviceId: service.id,
      userId:    user.sub,
      date:      body.date,
      startTime: body.startTime,
      endTime,
      notes:     typeof body.notes === "string" ? body.notes.slice(0, 1000) : null,
      status:    "AWAITING_PAYMENT",
      depositAmount,
      depositPaid: false,
    },
    include: { service: true },
  });

  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const checkout = await createYocoCheckout({
      metadata:    { appointmentId: appointment.id, type: "booking_deposit" },
      amountCents: depositAmount,
      successUrl:  `${appUrl}/services?booking=success`,
      cancelUrl:   `${appUrl}/services?booking=cancelled`,
    });
    await (db as any).appointment.update({ where: { id: appointment.id }, data: { paymentRef: checkout.id } });
    return created({ appointment, redirectUrl: checkout.redirectUrl, depositAmount }, "Redirecting to payment");
  } catch (err: any) {
    console.error("[Booking] Yoco checkout failed:", err?.message);
    await (db as any).appointment.update({ where: { id: appointment.id }, data: { status: "CANCELLED" } });
    return badRequest("Could not start the payment. Please try again.");
  }
}