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

// ─── ADD STOCK MODAL ─────────────────────────────────────────

interface StockModalProps {
  item:     InventoryItem;
  token:    string;
  onClose:  () => void;
  onSaved:  (updated: InventoryItem) => void;
}

function AddStockModal({ item, token, onClose, onSaved }: StockModalProps) {
  const [quantity, setQuantity] = useState("");
  const [mode, setMode]         = useState<"add" | "set">("add");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty < 1) return setError("Enter a valid quantity");
    setError(""); setLoading(true);

    const res = await fetch(`/api/admin/inventory/${item.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ quantity: qty, set: mode === "set" }),
      credentials: "include",
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.error ?? "Failed to update stock");

    onSaved({
      ...item,
      stock:       json.data.stock,
      stockStatus: json.data.stockStatus,
    });
    onClose();
  }

  const preview = mode === "add"
    ? item.stock + (Number(quantity) || 0)
    : Number(quantity) || 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-[#111111] border border-white/[0.06] p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="font-serif text-xl text-[#F5F0E8] font-light">Update Stock</h2>
            <p className="text-[#6B6B6B] text-xs mt-1">{item.product.name}</p>
            <p className="text-[#6B6B6B] text-xs font-mono">{item.sku}</p>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#F5F0E8] text-xl leading-none">×</button>
        </div>

        {/* Current stock */}
        <div className="bg-[#1A1A1A] border border-white/[0.06] p-4 mb-5 flex justify-between items-center">
          <span className="text-[#6B6B6B] text-xs tracking-widest uppercase">Current Stock</span>
          <span className={`font-serif text-2xl ${
            item.stock === 0 ? "text-red-400" :
            item.stock <= 5  ? "text-orange-400" :
            item.stock <= 10 ? "text-yellow-400" : "text-[#F5F0E8]"
          }`}>{item.stock} units</span>
        </div>

        {/* Mode toggle */}
        <div className="flex mb-4 border border-white/[0.06]">
          {(["add", "set"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 text-xs tracking-widest uppercase transition-colors ${
                mode === m
                  ? "bg-[#C9A84C] text-[#0A0A0A] font-medium"
                  : "text-[#6B6B6B] hover:text-[#F5F0E8]"
              }`}>
              {m === "add" ? "Add Units" : "Set To"}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">
            {mode === "add" ? "Units to Add" : "Set Stock To"}
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder={mode === "add" ? "e.g. 20" : "e.g. 50"}
            autoFocus
            className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] mb-3"
          />

          {/* Preview */}
          {quantity && Number(quantity) > 0 && (
            <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 px-4 py-2.5 mb-4 flex justify-between items-center">
              <span className="text-[#6B6B6B] text-xs">New stock will be</span>
              <span className="text-[#C9A84C] font-serif text-lg">{preview} units</span>
            </div>
          )}

          <button type="submit" disabled={loading || !quantity}
            className="w-full bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Saving…" : mode === "add" ? `Add ${quantity || 0} Units` : `Set to ${quantity || 0}`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────

export default function AdminInventoryPage() {
  const { token }     = useAuthStore();
  const [items, setItems]           = useState<InventoryItem[]>([]);
  const [summary, setSummary]       = useState<InventorySummary | null>(null);
  const [loading, setLoading]       = useState(true);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [selected, setSelected]     = useState<InventoryItem | null>(null);

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

  function handleStockSaved(updated: InventoryItem) {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    // Update summary counts
    if (summary) {
      const newItems = items.map(i => i.id === updated.id ? updated : i);
      setSummary({
        total:      newItems.length,
        outOfStock: newItems.filter(i => i.stock === 0).length,
        critical:   newItems.filter(i => i.stock > 0 && i.stock <= 5).length,
        low:        newItems.filter(i => i.stock > 5 && i.stock <= 15).length,
      });
    }
  }

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
            ["Low Stock Total",  summary.total,      ""],
            ["Out of Stock",     summary.outOfStock, "bg-red-500/10 border-red-800/40 text-red-400"],
            ["Critical (1–5)",   summary.critical,   "bg-orange-500/10 border-orange-800/40 text-orange-400"],
            ["Low (6–15)",       summary.low,        "bg-yellow-500/10 border-yellow-800/40 text-yellow-400"],
          ].map(([label, val, cls]) => (
            <div key={label as string} className={`bg-[#111111] border p-4 ${cls || "border-white/[0.06]"}`}>
              <p className="text-xs tracking-widest uppercase text-[#6B6B6B] mb-1">{label}</p>
              <p className={`font-serif text-3xl font-light ${cls ? "" : "text-[#F5F0E8]"}`}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-[#6B6B6B] cursor-pointer">
          <input type="checkbox" checked={outOfStockOnly}
            onChange={e => setOutOfStockOnly(e.target.checked)}
            className="accent-[#C9A84C]" />
          Out of stock only
        </label>
        <button onClick={load}
          className="text-[#C9A84C] text-xs tracking-widest uppercase hover:underline transition-colors">
          ↺ Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Product", "SKU", "Variant", "Stock", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#6B6B6B] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.06]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/[0.04] animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#6B6B6B]">
                  ✓ All products are well stocked
                </td>
              </tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                {/* Product */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.product.images[0] && (
                      <img src={item.product.images[0].url} alt=""
                        className="w-8 h-10 object-cover flex-shrink-0" />
                    )}
                    <span className="text-[#F5F0E8] text-sm">{item.product.name}</span>
                  </div>
                </td>
                {/* SKU */}
                <td className="px-4 py-3 text-[#6B6B6B] text-xs font-mono">{item.sku}</td>
                {/* Variant attributes */}
                <td className="px-4 py-3 text-[#6B6B6B] text-xs">
                  {[item.color, item.length && `${item.length}"`, item.laceType].filter(Boolean).join(" · ")}
                </td>
                {/* Stock number */}
                <td className="px-4 py-3">
                  <span className={`font-serif text-lg ${
                    item.stock === 0 ? "text-red-400" :
                    item.stock <= 5  ? "text-orange-400" :
                    "text-yellow-400"
                  }`}>
                    {item.stock}
                  </span>
                </td>
                {/* Status badge */}
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 border ${STOCK_STYLES[item.stockStatus]}`}>
                    {item.stockStatus.replace(/_/g, " ")}
                  </span>
                </td>
                {/* Action */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(item)}
                    className="text-[#C9A84C] text-xs hover:underline transition-colors"
                  >
                    + Add Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && token && (
        <AddStockModal
          item={selected}
          token={token}
          onClose={() => setSelected(null)}
          onSaved={handleStockSaved}
        />
      )}
    </div>
  );
}