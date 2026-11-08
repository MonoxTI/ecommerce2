// lib/admin/stats.handlers.ts
// Dashboard metrics and reporting.
//
// Rules used for the numbers (so the dashboard is a reliable record):
//  • Dates/months/"today" are calculated in South African time (SAST, UTC+2), not the server's clock.
//  • "Confirmed orders" = PAID, SHIPPED or DELIVERED. Pending (unpaid) and cancelled orders are NOT sales.
//  • Revenue = successful payments, excluding payments whose order was later CANCELLED.
//  • Store health only counts ACTIVE (visible) products; pre-order products are not "out of stock".

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok } from "@/lib/api/response";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { Role } from "@prisma/client";

// ─── SAST (Africa/Johannesburg) date helpers — no daylight saving ─────────
const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;

function sastMidnight(year: number, month: number, day: number): Date {
  // Date.UTC handles month/day overflow (e.g. month -1 = December last year)
  return new Date(Date.UTC(year, month, day) - SAST_OFFSET_MS);
}

function sastNowParts(now = new Date()) {
  const s = new Date(now.getTime() + SAST_OFFSET_MS);
  return { y: s.getUTCFullYear(), m: s.getUTCMonth(), d: s.getUTCDate() };
}

function sastDayKey(date: Date): string {
  return new Date(date.getTime() + SAST_OFFSET_MS).toISOString().slice(0, 10); // "2026-11-03"
}

const growthPct = (current: number, previous: number): number | null =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

const CONFIRMED = ["PAID", "SHIPPED", "DELIVERED"] as const;

// ─── DASHBOARD STATS ─────────────────────────────────────────
// GET /api/admin/stats

export async function handleAdminStats(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const { y, m, d } = sastNowParts();
  const startOfToday     = sastMidnight(y, m, d);
  const startOfMonth     = sastMidnight(y, m, 1);
  const startOfLastMonth = sastMidnight(y, m - 1, 1);

  // Only successful payments whose order was not cancelled afterwards
  const paidWhere = { status: "SUCCESS" as const, order: { status: { not: "CANCELLED" as const } } };
  const confirmed = { status: { in: [...CONFIRMED] } };
  const liveVariant = { product: { isActive: true, isPreOrder: false } };

  // Separate parallel queries — no interactive transactions needed
  const [
    allOrders, confirmedTotal, confirmedToday, confirmedThisMonth, confirmedLastMonth,
    pendingOrders, toShipOrders, shippedOrders, deliveredOrders, cancelledOrders,
    revenueTotal, revenueToday, revenueThisMonth, revenueLastMonth,
    totalCustomers, newCustomersThisMonth,
    activeProducts, hiddenProducts, preOrderProducts, totalVariants, outOfStock, lowStock,
    pendingReviews, newBookings,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: confirmed }),
    db.order.count({ where: { ...confirmed, createdAt: { gte: startOfToday } } }),
    db.order.count({ where: { ...confirmed, createdAt: { gte: startOfMonth } } }),
    db.order.count({ where: { ...confirmed, createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PAID" } }),       // paid, waiting to be shipped
    db.order.count({ where: { status: "SHIPPED" } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.order.count({ where: { status: "CANCELLED" } }),
    db.payment.aggregate({ _sum: { amount: true }, where: paidWhere }),
    db.payment.aggregate({ _sum: { amount: true }, where: { ...paidWhere, createdAt: { gte: startOfToday } } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { ...paidWhere, createdAt: { gte: startOfMonth } } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { ...paidWhere, createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    db.user.count({ where: { role: Role.CUSTOMER } }),
    db.user.count({ where: { role: Role.CUSTOMER, createdAt: { gte: startOfMonth } } }),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: false } }),
    db.product.count({ where: { isActive: true, isPreOrder: true } }),
    db.productVariant.count({ where: { product: { isActive: true } } }),
    db.productVariant.count({ where: { stock: 0, ...liveVariant } }),
    db.productVariant.count({ where: { stock: { gt: 0, lte: 5 }, ...liveVariant } }),
    db.review.count({ where: { verified: false } }),
    (db as any).appointment.count({ where: { depositPaid: true, adminSeen: false } }), // new paid bookings
  ]);

  const revTotal     = revenueTotal._sum.amount     ?? 0; // cents
  const revToday     = revenueToday._sum.amount     ?? 0;
  const revThisMonth = revenueThisMonth._sum.amount ?? 0;
  const revLastMonth = revenueLastMonth._sum.amount ?? 0;

  return ok({
    orders: {
      total:      confirmedTotal,              // confirmed (paid) orders only
      today:      confirmedToday,
      thisMonth:  confirmedThisMonth,
      lastMonth:  confirmedLastMonth,
      growth:     growthPct(confirmedThisMonth, confirmedLastMonth),
      all:        allOrders,                   // everything, incl. unpaid and cancelled
      pending:    pendingOrders,               // unpaid
      paid:       toShipOrders,                // paid, waiting to ship
      shipped:    shippedOrders,
      delivered:  deliveredOrders,
      cancelled:  cancelledOrders,
      averageValue: confirmedTotal > 0 ? Math.round(revTotal / confirmedTotal) / 100 : 0, // rands
    },
    revenue: {
      total:      revTotal / 100,              // rands
      today:      revToday / 100,
      thisMonth:  revThisMonth / 100,
      lastMonth:  revLastMonth / 100,
      growth:     growthPct(revThisMonth, revLastMonth),
    },
    customers: {
      total:        totalCustomers,
      newThisMonth: newCustomersThisMonth,
    },
    products: {
      total:      activeProducts,
      hidden:     hiddenProducts,
      preOrder:   preOrderProducts,
      variants:   totalVariants,
      outOfStock,
      lowStock,   // stock 1–5
    },
    alerts: {
      pendingOrders,
      toShip: toShipOrders,
      outOfStock,
      lowStock,
      pendingReviews,
      newBookings,
    },
    generatedAt: new Date().toISOString(),
  });
}

// ─── REVENUE CHART DATA ──────────────────────────────────────
// GET /api/admin/stats/revenue
// Daily revenue for the last 30 days (SAST), zero-filled so charts have no gaps.

export async function handleRevenueChart(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const { y, m, d } = sastNowParts();
  const start = sastMidnight(y, m, d - 29);

  const payments = await db.payment.findMany({
    where: {
      status:    "SUCCESS",
      order:     { status: { not: "CANCELLED" } },
      createdAt: { gte: start },
    },
    select:  { amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const daily: Record<string, number> = {};
  for (let i = 0; i < 30; i++) daily[sastDayKey(sastMidnight(y, m, d - 29 + i))] = 0;
  for (const p of payments) {
    const key = sastDayKey(p.createdAt);
    if (key in daily) daily[key] += p.amount;
  }

  return ok(
    Object.entries(daily).map(([date, amount]) => ({
      date,
      amount:      amount / 100, // rands
      amountCents: amount,
    }))
  );
}