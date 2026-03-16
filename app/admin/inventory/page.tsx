"use client";
// app/admin/inventory/page.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminApi, InventoryItem, InventorySummary } from "@/lib/api";

const STOCK_STYLES: Record<string, string> = {
  OUT_OF_STOCK: "bg-red-500/10 text-red-400 border-red-500/20",
  CRITICAL:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  LOW:          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  OK:           "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function AdminInventoryPage() {
  const { token }     = useAuthStore();
  const [items, setItems]           = useState<InventoryItem[]>([]);
  const [summary, setSummary]       = useState<InventorySummary | null>(null);
  const [loading, setLoading]       = useState(true);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true);
    const params: Record<string, string> = { threshold: "15" };
    if (outOfStockOnly) params.outOfStock = "true";
    const { data } = await adminApi.inventory(token, params);
    if (data) { setItems(data.items); setSummary(data.summary); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [token, outOfStockOnly]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Inventory</h1>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            ["Low Stock Total", summary.total, ""],
            ["Out of Stock", summary.outOfStock, "bg-red-500/10 border-red-800/40 text-red-400"],
            ["Critical (1-5)", summary.critical, "bg-orange-500/10 border-orange-800/40 text-orange-400"],
            ["Low (6-15)", summary.low, "bg-yellow-500/10 border-yellow-800/40 text-yellow-400"],
          ].map(([label, val, cls]) => (
            <div key={label as string} className={`bg-[#111111] border p-4 ${cls || "border-white/[0.06]"}`}>
              <p className="text-xs tracking-widest uppercase text-[#6B6B6B] mb-1">{label}</p>
              <p className={`font-serif text-3xl font-light ${cls ? "" : "text-[#F5F0E8]"}`}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm text-[#6B6B6B] cursor-pointer">
          <input type="checkbox" checked={outOfStockOnly} onChange={e => setOutOfStockOnly(e.target.checked)}
            className="accent-[#C9A84C]" />
          Out of stock only
        </label>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Product", "SKU", "Variant", "Stock", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#6B6B6B] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.06]">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-[#6B6B6B]">All products are well stocked ✓</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.product.images[0] && (
                      <img src={item.product.images[0].url} alt="" className="w-8 h-10 object-cover flex-shrink-0" />
                    )}
                    <span className="text-[#F5F0E8] text-sm">{item.product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs font-mono">{item.sku}</td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs">
                  {[item.color, item.length && `${item.length}"`, item.laceType].filter(Boolean).join(" · ")}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-serif text-lg ${item.stock === 0 ? "text-red-400" : item.stock <= 5 ? "text-orange-400" : "text-yellow-400"}`}>
                    {item.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 border ${STOCK_STYLES[item.stockStatus]}`}>
                    {item.stockStatus.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}