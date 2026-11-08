// app/admin/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, AdminStats } from "@/lib/api";

// Extra fields returned by the updated /api/admin/stats (all optional so an older server still works)
type Stats = AdminStats & {
  orders?: { all?: number; delivered?: number; cancelled?: number; averageValue?: number };
  revenue?: { today?: number };
  products?: { hidden?: number; preOrder?: number };
  alerts?: { toShip?: number; newBookings?: number };
  generatedAt?: string;
};

// ─── HELPERS ─────────────────────────────────────────────────
function formatPrice(rands: number) {
  return `R${rands.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ─── STAT CARD ───────────────────────────────────────────────
function StatCard({
  label, value, sub, highlight = false, alert = false, href,
}: {
  label: string; value: string | number; sub?: string;
  highlight?: boolean; alert?: boolean; href?: string;
}) {
  const body = (
    <div className={`bg-white border p-4 h-full transition-colors ${
      alert ? "border-red-300" : highlight ? "border-black" : "border-black/10"
    } ${href ? "hover:border-black" : ""}`}>
      <p className="text-[#666666] text-xs tracking-widest uppercase mb-1.5 font-cormorant">{label}</p>
      <p className={`font-playfair text-2xl md:text-3xl font-semibold ${alert ? "text-red-600" : "text-black"}`}>{value}</p>
      {sub && <p className="text-[#666666] text-xs mt-1 font-cormorant">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}

function growthText(g: number | null | undefined) {
  return g != null ? `${g > 0 ? "+" : ""}${g}% vs last month` : undefined;
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState("");

  const load = useCallback(async (manual = false) => {
    manual ? setRefreshing(true) : setLoading(true);
    const { data, error } = await adminApi.stats();
    if (error) setError(error);
    else if (data) { setStats(data as Stats); setError(""); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 bg-white border border-black/10 animate-pulse" />
      ))}
    </div>
  );

  if (error && !stats) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm font-cormorant">{error}</div>
  );

  if (!stats) return <p className="text-[#666666] font-cormorant">Failed to load stats</p>;

  const o = (stats.orders   ?? {}) as Partial<NonNullable<Stats["orders"]>>;
  const r = (stats.revenue  ?? {}) as Partial<NonNullable<Stats["revenue"]>>;
  const p = (stats.products ?? {}) as Partial<NonNullable<Stats["products"]>>;
  const c = stats.customers;
  const a = (stats.alerts ?? {}) as Partial<NonNullable<Stats["alerts"]>>;
  const pendingOrders = a.pendingOrders ?? o.pending ?? 0;
  const outOfStock    = a.outOfStock    ?? p.outOfStock ?? 0;
  const lowStock      = a.lowStock      ?? p.lowStock   ?? 0;

  const toShip = a.toShip ?? o.paid ?? 0;
  const newBookings = a.newBookings ?? 0;
  const updated = stats.generatedAt
    ? new Date(stats.generatedAt).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="font-cormorant pb-6">

      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-black text-xs tracking-[0.2em] uppercase font-medium mb-1">Overview</p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#666666]">
          {updated && <span>Updated {updated}</span>}
          <button
            onClick={() => load(true)} disabled={refreshing}
            className="border border-black/20 px-3 py-1.5 uppercase tracking-wider hover:border-black hover:text-black transition-colors disabled:opacity-50">
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-xs">Could not refresh: {error}</div>
      )}

      {/* Action alerts */}
      {(newBookings > 0 || toShip > 0 || pendingOrders > 0 || outOfStock > 0 || lowStock > 0) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {newBookings > 0 && (
            <Link href="/admin/services" className="bg-green-50 border border-green-300 text-green-800 text-xs px-4 py-2">
              🗓 {newBookings} new booking{newBookings !== 1 ? "s" : ""} (deposit paid)
            </Link>
          )}
          {toShip > 0 && (
            <Link href="/admin/orders" className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-2">
              📦 {toShip} paid order{toShip !== 1 ? "s" : ""} waiting to be shipped
            </Link>
          )}
          {pendingOrders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-4 py-2">
              ⚠ {pendingOrders} order{pendingOrders !== 1 ? "s" : ""} awaiting payment
            </div>
          )}
          {outOfStock > 0 && (
            <Link href="/admin/inventory" className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2">
              ✕ {outOfStock} variant{outOfStock !== 1 ? "s" : ""} out of stock
            </Link>
          )}
          {lowStock > 0 && (
            <Link href="/admin/inventory" className="bg-orange-50 border border-orange-200 text-orange-700 text-xs px-4 py-2">
              ↓ {lowStock} variant{lowStock !== 1 ? "s" : ""} running low
            </Link>
          )}
        </div>
      )}

      {/* Revenue */}
      <section className="mb-5">
        <p className="text-[#666666] text-xs tracking-widest uppercase mb-2">Revenue (paid orders only)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Revenue" value={formatPrice(stats.revenue?.total ?? 0)} highlight />
          <StatCard label="This Month" value={formatPrice(stats.revenue?.thisMonth ?? 0)} sub={growthText(stats.revenue?.growth)} highlight />
          <StatCard label="Last Month" value={formatPrice(stats.revenue?.lastMonth ?? 0)} />
          <StatCard label="Today" value={formatPrice(r.today ?? 0)} />
        </div>
      </section>

      {/* Orders */}
      <section className="mb-5">
        <p className="text-[#666666] text-xs tracking-widest uppercase mb-2">Orders</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Paid Orders" value={o.total ?? 0} sub={`${o.thisMonth ?? 0} this month · ${growthText(o.growth) ?? "no last-month data"}`} href="/admin/orders" />
          <StatCard label="Today" value={o.today ?? 0} />
          <StatCard label="Avg. Order Value" value={formatPrice(o.averageValue ?? 0)} />
          <StatCard label="Awaiting Payment" value={o.pending ?? 0} alert={(o.pending ?? 0) > 0} href="/admin/orders" />
          <StatCard label="To Ship" value={toShip} alert={toShip > 0} href="/admin/orders" sub="Paid, not yet shipped" />
          <StatCard label="Shipped" value={o.shipped ?? 0} />
          <StatCard label="Delivered" value={o.delivered ?? 0} />
          <StatCard label="Cancelled" value={o.cancelled ?? 0} sub={o.all != null ? `${o.all} orders in total, incl. unpaid` : undefined} />
        </div>
      </section>

      {/* Store health */}
      <section>
        <p className="text-[#666666] text-xs tracking-widest uppercase mb-2">Store Health</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Customers" value={c?.total ?? 0} sub={`+${c?.newThisMonth ?? 0} this month`} />
          <StatCard label="Active Products" value={p.total ?? 0} sub={`${p.hidden ?? 0} hidden · ${p.preOrder ?? 0} pre-order`} href="/admin/products" />
          <StatCard label="Out of Stock" value={p.outOfStock ?? 0} alert={(p.outOfStock ?? 0) > 0} href="/admin/inventory" sub="Variants (excl. pre-order)" />
          <StatCard label="Low Stock" value={p.lowStock ?? 0} alert={(p.lowStock ?? 0) > 0} href="/admin/inventory" sub="1–5 left" />
        </div>
      </section>

      <p className="text-[#666666] text-xs mt-5">
        Times use South African time. Revenue counts successful payments only; unpaid and cancelled orders are excluded.
      </p>
    </div>
  );
}