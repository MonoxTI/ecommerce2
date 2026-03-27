// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminApi, AdminStats } from "@/lib/api";

// ─── HELPERS ─────────────────────────────────────────────────
function formatPrice(rands: number) {
  return `R${rands.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

// ─── STAT CARD COMPONENT ─────────────────────────────────────
function StatCard({ 
  label, 
  value, 
  sub, 
  highlight = false, 
  alert = false 
}: {
  label: string; 
  value: string | number; 
  sub?: string; 
  highlight?: boolean; 
  alert?: boolean;
}) {
  // ── COLOR PALETTE (Cream / Black / White) ─────────────────
  const colors = {
    bg: "bg-white",
    border: "border-black/10",
    borderHighlight: "border-black",
    borderAlert: "border-red-300",
    text: "text-black",
    textMuted: "text-[#666666]",
    textHighlight: "text-black",
    textAlert: "text-red-600",
    subText: "text-[#666666]",
  };

  return (
    <div className={`${colors.bg} border ${alert ? colors.borderAlert : highlight ? colors.borderHighlight : colors.border} p-5`}>
      <p className={`${colors.textMuted} text-xs tracking-widest uppercase mb-2 font-cormorant`}>
        {label}
      </p>
      <p className={`font-playfair text-3xl font-semibold ${alert ? colors.textAlert : colors.textHighlight}`}>
        {value}
      </p>
      {sub && <p className={`${colors.subText} text-xs mt-1 font-cormorant`}>{sub}</p>}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { getValidToken }     = useAuthStore();
  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // ── COLOR PALETTE (Cream / Black / White) ─────────────────
  const colors = {
    bg: "bg-[#F1F1F1]",
    card: "bg-white",
    text: "text-black",
    textMuted: "text-[#333333]",
    textLight: "text-[#666666]",
    border: "border-black/10",
    borderHighlight: "border-black",
    buttonBg: "bg-black",
    buttonHover: "hover:bg-[#333333]",
    alertYellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    alertRed: "bg-red-50 border-red-200 text-red-700",
    alertOrange: "bg-orange-50 border-orange-200 text-orange-700",
    linkHover: "hover:text-black",
  };

  useEffect(() => {
    async function load() {
      const token = await getValidToken();
      if (!token) { setError("Session expired. Please sign in again."); setLoading(false); return; }
      const { data, error } = await adminApi.stats(token);
      if (error) setError(error);
      else if (data) setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`h-28 ${colors.card} border ${colors.border} animate-pulse`} />
      ))}
    </div>
  );

  if (error) return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm font-cormorant`}>
      {error}
    </div>
  );

  if (!stats) return <p className={`${colors.textLight} font-cormorant`}>Failed to load stats</p>;

  // Safe defaults in case backend returns an older response shape
  const alerts = stats.alerts ?? {
    pendingOrders:  stats.orders?.pending   ?? 0,
    outOfStock:     stats.products?.outOfStock ?? 0,
    lowStock:       stats.products?.lowStock   ?? 0,
    pendingReviews: 0,
  };

  return (
    <div className={`${colors.bg} min-h-screen font-cormorant`}>
      
      {/* Header */}
      <div className="mb-8">
        <p className="text-black text-xs tracking-[0.2em] uppercase font-cormorant font-medium mb-1">Overview</p>
        <h1 className="font-playfair text-4xl text-black font-semibold">Dashboard</h1>
      </div>

      {/* Alerts */}
      {(alerts.pendingOrders > 0 || alerts.outOfStock > 0 || alerts.lowStock > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {alerts.pendingOrders > 0 && (
            <div className={`${colors.alertYellow} text-xs px-4 py-2 font-cormorant`}>
              ⚠ {alerts.pendingOrders} pending order{alerts.pendingOrders !== 1 ? "s" : ""} awaiting payment
            </div>
          )}
          {alerts.outOfStock > 0 && (
            <div className={`${colors.alertRed} text-xs px-4 py-2 font-cormorant`}>
              ✕ {alerts.outOfStock} variant{alerts.outOfStock !== 1 ? "s" : ""} out of stock
            </div>
          )}
          {alerts.lowStock > 0 && (
            <div className={`${colors.alertOrange} text-xs px-4 py-2 font-cormorant`}>
              ↓ {alerts.lowStock} variant{alerts.lowStock !== 1 ? "s" : ""} running low
            </div>
          )}
        </div>
      )}

      {/* Revenue */}
      <div className="mb-6">
        <p className={`${colors.textLight} text-xs tracking-widest uppercase mb-3`}>Revenue</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Revenue" value={formatPrice(stats.revenue?.total ?? 0)} highlight />
          <StatCard
            label="This Month"
            value={formatPrice(stats.revenue?.thisMonth ?? 0)}
            sub={stats.revenue?.growth != null
              ? `${stats.revenue.growth > 0 ? "+" : ""}${stats.revenue.growth}% vs last month`
              : undefined}
            highlight
          />
          <StatCard label="Last Month" value={formatPrice(stats.revenue?.lastMonth ?? 0)} />
        </div>
      </div>

      {/* Orders */}
      <div className="mb-6">
        <p className={`${colors.textLight} text-xs tracking-widest uppercase mb-3`}>Orders</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={stats.orders?.total   ?? 0} />
          <StatCard label="Today"        value={stats.orders?.today   ?? 0} />
          <StatCard label="Pending"      value={stats.orders?.pending ?? 0} alert={(stats.orders?.pending ?? 0) > 0} />
          <StatCard label="Shipped"      value={stats.orders?.shipped ?? 0} />
        </div>
      </div>

      {/* Store health */}
      <div className="mb-8">
        <p className={`${colors.textLight} text-xs tracking-widest uppercase mb-3`}>Store Health</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Customers"    value={stats.customers?.total      ?? 0} sub={`+${stats.customers?.newThisMonth ?? 0} this month`} />
          <StatCard label="Products"     value={stats.products?.total       ?? 0} />
          <StatCard label="Out of Stock" value={stats.products?.outOfStock  ?? 0} alert={(stats.products?.outOfStock ?? 0) > 0} />
          <StatCard label="Low Stock"    value={stats.products?.lowStock    ?? 0} alert={(stats.products?.lowStock    ?? 0) > 0} />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className={`${colors.textLight} text-xs tracking-widest uppercase mb-3`}>Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["/admin/orders?status=PENDING",    "View Pending Orders"],
            ["/admin/inventory?outOfStock=true", "Restock Products"],
            ["/admin/orders",                    "All Orders"],
            ["/admin/customers",                 "Customers"],
          ].map(([href, label]) => (
            <a 
              key={href} 
              href={href}
              className={`${colors.card} border ${colors.border} ${colors.linkHover} p-4 text-sm ${colors.textLight} transition-colors text-center font-cormorant`}
            >
              {label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}