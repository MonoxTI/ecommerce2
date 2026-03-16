"use client";
// app/admin/page.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminApi, AdminStats } from "@/lib/api";

function formatPrice(rands: number) {
  return `R${rands.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function StatCard({ label, value, sub, highlight = false, alert = false }: {
  label: string; value: string | number; sub?: string; highlight?: boolean; alert?: boolean;
}) {
  return (
    <div className={`bg-[#111111] border p-5 ${alert ? "border-red-800/40" : highlight ? "border-[#C9A84C]/30" : "border-white/[0.06]"}`}>
      <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">{label}</p>
      <p className={`font-serif text-3xl font-light ${alert ? "text-red-400" : highlight ? "text-[#C9A84C]" : "text-[#F5F0E8]"}`}>
        {value}
      </p>
      {sub && <p className="text-[#6B6B6B] text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token }        = useAuthStore();
  const [stats, setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminApi.stats(token).then(({ data }) => {
      if (data) setStats(data);
      setLoading(false);
    });
  }, [token]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-28 bg-[#111111] animate-pulse" />
      ))}
    </div>
  );

  if (!stats) return <p className="text-[#6B6B6B]">Failed to load stats</p>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Overview</p>
        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Dashboard</h1>
      </div>

      {/* Alerts */}
      {(stats.alerts.pendingOrders > 0 || stats.alerts.outOfStock > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {stats.alerts.pendingOrders > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-4 py-2">
              ⚠ {stats.alerts.pendingOrders} pending order{stats.alerts.pendingOrders !== 1 ? "s" : ""} awaiting payment
            </div>
          )}
          {stats.alerts.outOfStock > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2">
              ✕ {stats.alerts.outOfStock} variant{stats.alerts.outOfStock !== 1 ? "s" : ""} out of stock
            </div>
          )}
          {stats.alerts.lowStock > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-4 py-2">
              ↓ {stats.alerts.lowStock} variant{stats.alerts.lowStock !== 1 ? "s" : ""} running low
            </div>
          )}
        </div>
      )}

      {/* Revenue */}
      <div className="mb-6">
        <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-3">Revenue</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Revenue" value={formatPrice(stats.revenue.total)} highlight />
          <StatCard
            label="This Month"
            value={formatPrice(stats.revenue.thisMonth)}
            sub={stats.revenue.growth !== null ? `${stats.revenue.growth > 0 ? "+" : ""}${stats.revenue.growth}% vs last month` : undefined}
            highlight
          />
          <StatCard label="Last Month" value={formatPrice(stats.revenue.lastMonth)} />
        </div>
      </div>

      {/* Orders */}
      <div className="mb-6">
        <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-3">Orders</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={stats.orders.total} />
          <StatCard label="Today" value={stats.orders.today} />
          <StatCard label="Pending" value={stats.orders.pending} alert={stats.orders.pending > 0} />
          <StatCard label="Shipped" value={stats.orders.shipped} />
        </div>
      </div>

      {/* Customers & Products */}
      <div className="mb-8">
        <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-3">Store Health</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Customers" value={stats.customers.total} sub={`+${stats.customers.newThisMonth} this month`} />
          <StatCard label="Products" value={stats.products.total} />
          <StatCard label="Out of Stock" value={stats.products.outOfStock} alert={stats.products.outOfStock > 0} />
          <StatCard label="Low Stock" value={stats.products.lowStock} alert={stats.products.lowStock > 0} />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["/admin/orders?status=PENDING", "View Pending Orders"],
            ["/admin/inventory?outOfStock=true", "Restock Products"],
            ["/admin/orders", "All Orders"],
            ["/admin/customers", "Customers"],
          ].map(([href, label]) => (
            <a key={href} href={href}
              className="bg-[#111111] border border-white/[0.06] hover:border-[#C9A84C]/40 p-4 text-sm text-[#6B6B6B] hover:text-[#C9A84C] transition-colors text-center">
              {label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}