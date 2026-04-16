// lib/admin/stats.handlers.ts
// Dashboard metrics and reporting.

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok } from "@/lib/api/response";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { Role } from "@prisma/client";

// ─── DASHBOARD STATS ─────────────────────────────────────────
// GET /api/admin/stats

export async function handleAdminStats(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const now           = new Date();
  const startOfToday  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Run as parallel queries with Promise.all — Neon serverless doesn't support interactive transactions
  const [
    totalOrders, ordersToday, ordersThisMonth, ordersLastMonth,
    pendingOrders, paidOrders, shippedOrders,
    revenueTotal, revenueThisMonth, revenueLastMonth,
    totalCustomers, newCustomersThisMonth,
    totalProducts, totalVariants, outOfStock, lowStock, pendingReviews,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: startOfToday } } }),
    db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PAID" } }),
    db.order.count({ where: { status: "SHIPPED" } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS", createdAt: { gte: startOfMonth } } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    db.user.count({ where: { role: Role.CUSTOMER } }),
    db.user.count({ where: { role: Role.CUSTOMER, createdAt: { gte: startOfMonth } } }),
    db.product.count(),
    db.productVariant.count(),
    db.productVariant.count({ where: { stock: 0 } }),
    db.productVariant.count({ where: { stock: { gt: 0, lte: 5 } } }),
    db.review.count({ where: { verified: false } }),
  ]);

  // Month-over-month revenue growth %
  const revThisMonth = revenueThisMonth._sum.amount ?? 0;
  const revLastMonth = revenueLastMonth._sum.amount ?? 0;
  const revenueGrowth = revLastMonth > 0
    ? Math.round(((revThisMonth - revLastMonth) / revLastMonth) * 100)
    : null;

  // Month-over-month order growth %
  const orderGrowth = ordersLastMonth > 0
    ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
    : null;

  return ok({
    orders: {
      total:      totalOrders,
      today:      ordersToday,
      thisMonth:  ordersThisMonth,
      lastMonth:  ordersLastMonth,
      growth:     orderGrowth,     // % change vs last month
      pending:    pendingOrders,
      paid:       paidOrders,
      shipped:    shippedOrders,
    },
    revenue: {
      total:      (revenueTotal._sum.amount     ?? 0) / 100, // rands
      thisMonth:  revThisMonth / 100,
      lastMonth:  revLastMonth / 100,
      growth:     revenueGrowth,   // % change vs last month
    },
    customers: {
      total:      totalCustomers,
      newThisMonth: newCustomersThisMonth,
    },
    products: {
      total:      totalProducts,
      variants:   totalVariants,
      outOfStock,
      lowStock,   // stock 1–5
    },
    alerts: {
      pendingOrders,
      outOfStock,
      lowStock,
      pendingReviews,
    },
  });
}

// ─── REVENUE CHART DATA ──────────────────────────────────────
// GET /api/admin/stats/revenue
// Returns daily revenue for the last 30 days for charts.

export async function handleRevenueChart(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (isErrorResponse(auth)) return auth;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const payments = await db.payment.findMany({
    where: {
      status:    "SUCCESS",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dailyRevenue: Record<string, number> = {};
  for (const payment of payments) {
    const day = payment.createdAt.toISOString().slice(0, 10); // "2024-01-15"
    dailyRevenue[day] = (dailyRevenue[day] ?? 0) + payment.amount;
  }

  const chartData = Object.entries(dailyRevenue).map(([date, amount]) => ({
    date,
    amount:      amount / 100, // rands
    amountCents: amount,
  }));

  return ok(chartData);
}