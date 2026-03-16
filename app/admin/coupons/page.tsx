"use client";
// app/admin/coupons/page.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminApi, Coupon } from "@/lib/api";

export default function AdminCouponsPage() {
  const { token }     = useAuthStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "", type: "PERCENTAGE", active: true, maxUses: "", expiresAt: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!token) return;
    setLoading(true);
    const { data } = await adminApi.coupons(token);
    if (data) setCoupons(data.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, [token]);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(""); setCreating(true);
    const payload: any = {
      code:    form.code.toUpperCase(),
      discount: Number(form.discount),
      type:    form.type,
      active:  form.active,
    };
    if (form.maxUses) payload.maxUses = Number(form.maxUses);
    if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();

    const { error } = await adminApi.createCoupon(payload, token);
    setCreating(false);
    if (error) return setError(error);
    setShowForm(false);
    setForm({ code: "", discount: "", type: "PERCENTAGE", active: true, maxUses: "", expiresAt: "" });
    load();
  }

  async function deleteCoupon(id: string) {
    if (!token || !confirm("Delete this coupon?")) return;
    await adminApi.deleteCoupon(id, token);
    setCoupons(cs => cs.filter(c => c.id !== id));
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Coupons</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-5 py-2 text-xs tracking-widest uppercase transition-colors">
          {showForm ? "Cancel" : "+ New Coupon"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[#111111] border border-[#C9A84C]/20 p-6 mb-6">
          <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-4">Create Coupon</h2>
          {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
          <form onSubmit={createCoupon} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[["Code", "code", "text", "SAVE10"], ["Discount Value", "discount", "number", "10"], ["Max Uses", "maxUses", "number", "Optional"]].map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">{label}</label>
                <input type={type} placeholder={placeholder} value={form[key as keyof typeof form] as string}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder:text-[#6B6B6B]"
                />
              </div>
            ))}
            <div>
              <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-3 py-2 text-sm outline-none focus:border-[#C9A84C]">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (R)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Expires At</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-3 py-2 text-sm outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={creating}
                className="w-full bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-2 text-xs tracking-widest uppercase transition-colors disabled:opacity-60">
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111111] border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Code", "Discount", "Type", "Usage", "Expires", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#6B6B6B] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.06]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-[#6B6B6B]">No coupons yet</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-[#C9A84C] font-medium">{c.code}</td>
                <td className="px-4 py-3 text-[#F5F0E8]">{c.discountDisplay}</td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs">{c.type}</td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-ZA") : "Never"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 border ${
                    !c.active || c.isExpired
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}>
                    {!c.active ? "Inactive" : c.isExpired ? "Expired" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteCoupon(c.id)} className="text-red-400 text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}