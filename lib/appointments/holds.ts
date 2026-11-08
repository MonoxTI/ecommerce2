// lib/appointments/holds.ts
// Deposit + slot-hold rules for service bookings.
import { db } from "@/lib/DB/prisma";

export const DEPOSIT_PERCENT = 50;
export const HOLD_MINUTES = 30;

/** 50% of the service price, in cents (rounded up). */
export const depositFor = (priceCents: number) => Math.ceil((priceCents * DEPOSIT_PERCENT) / 100);

/** Appointments with these statuses do NOT block a time slot. */
export const FREE_STATUSES = ["CANCELLED", "EXPIRED", "CONFLICT"];
export const blocking = { status: { notIn: FREE_STATUSES } };

/** Release unpaid holds older than HOLD_MINUTES so the slot can be booked again. */
export async function expireStaleHolds() {
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);
  const r = await (db as any).appointment.updateMany({
    where: { status: "AWAITING_PAYMENT", depositPaid: false, createdAt: { lt: cutoff } },
    data:  { status: "EXPIRED" },
  });
  return r.count as number;
}