"use client";
// app/admin/orders/page.tsx
import { useEffect, useState } from "react";
import { adminApi, Order } from "@/lib/api";

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

const STATUS_OPTIONS = ["", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PAID:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHIPPED:   "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminOrdersPage() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [tracking, setTracking]   = useState({ trackingNumber: "", trackingUrl: "" });
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    const { data } = await adminApi.orders(params);
    if (data) setOrders(data.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function updateStatus() {
    if (!selected || !newStatus) return;
    setActionLoading(true);
    await adminApi.updateOrderStatus(selected.id, newStatus);
    setActionLoading(false);
    setSelected(null);
    load();
  }

  async function addTracking() {
    if (!selected || !tracking.trackingNumber) return;
    setActionLoading(true);
    await adminApi.addTracking(selected.id, tracking);
    setActionLoading(false);
    setSelected(null);
    load();
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text" placeholder="Search by email…" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load()}
          className="bg-[#111111] border border-white/[0.06] text-[#F5F0E8] px-4 py-2 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] w-56"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#111111] border border-white/[0.06] text-[#F5F0E8] px-4 py-2 text-sm outline-none focus:border-[#C9A84C] transition-colors">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || "All Statuses"}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#6B6B6B] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.06]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-[#6B6B6B]">No orders found</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-[#F5F0E8] text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs">
                  <p className="text-[#F5F0E8]">{order.user?.name ?? "—"}</p>
                  <p>{order.user?.email ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-[#6B6B6B]">{order.items?.length ?? "—"}</td>
                <td className="px-4 py-3 text-[#C9A84C] font-serif">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 border ${STATUS_STYLES[order.status] ?? ""}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString("en-ZA")}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => { setSelected(order); setNewStatus(order.status); }}
                    className="text-[#C9A84C] text-xs hover:underline">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-[#111111] border border-white/[0.06] p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="font-serif text-xl text-[#F5F0E8]">Order #{selected.id.slice(0, 8).toUpperCase()}</h2>
                <p className="text-[#6B6B6B] text-xs mt-1">{selected.user?.name} — {formatPrice(selected.total)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#6B6B6B] hover:text-[#F5F0E8] text-xl">×</button>
            </div>

            {/* Update Status */}
            <div className="mb-5">
              <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Update Status</label>
              <div className="flex gap-2">
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="flex-1 bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                  {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={updateStatus} disabled={actionLoading}
                  className="bg-[#C9A84C] text-[#0A0A0A] px-4 py-2 text-xs tracking-wider uppercase hover:bg-[#E2C97E] transition-colors disabled:opacity-60">
                  Update
                </button>
              </div>
            </div>

            {/* Add Tracking */}
            <div>
              <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Add Tracking</label>
              <input type="text" placeholder="Tracking number" value={tracking.trackingNumber}
                onChange={e => setTracking({ ...tracking, trackingNumber: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] mb-2 placeholder:text-[#6B6B6B]"
              />
              <input type="text" placeholder="Tracking URL (optional)" value={tracking.trackingUrl}
                onChange={e => setTracking({ ...tracking, trackingUrl: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] mb-2 placeholder:text-[#6B6B6B]"
              />
              <button onClick={addTracking} disabled={actionLoading || !tracking.trackingNumber}
                className="w-full bg-[#1A1A1A] border border-[#C9A84C]/40 text-[#C9A84C] py-2 text-xs tracking-wider uppercase hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-40">
                {actionLoading ? "Saving…" : "Save Tracking + Mark Shipped"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}