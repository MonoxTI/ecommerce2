"use client";
// app/admin/customers/page.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { adminApi, Customer } from "@/lib/api";

export default function AdminCustomersPage() {
  const { token }       = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [toggling, setToggling]   = useState<string | null>(null);

  async function load(q = "") {
    if (!token) return;
    setLoading(true);
    const { data } = await adminApi.customers(token, q ? { search: q } : {});
    if (data) setCustomers(data.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, [token]);

  async function toggle(id: string, current: boolean) {
    if (!token) return;
    setToggling(id);
    await adminApi.toggleCustomer(id, !current, token);
    setCustomers(cs => cs.map(c => c.id === id ? { ...c, isActive: !current } : c));
    setToggling(null);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Customers</h1>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input type="text" placeholder="Search by name or email…" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load(search)}
          className="bg-[#111111] border border-white/[0.06] text-[#F5F0E8] px-4 py-2 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] w-72"
        />
        <button onClick={() => load(search)}
          className="bg-[#C9A84C] text-[#0A0A0A] px-5 py-2 text-xs tracking-widest uppercase hover:bg-[#E2C97E] transition-colors">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Customer", "Phone", "Orders", "Joined", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#6B6B6B] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.06]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[#6B6B6B]">No customers found</td></tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <p className="text-[#F5F0E8] text-sm">{c.name}</p>
                  <p className="text-[#6B6B6B] text-xs">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs">{c.phone}</td>
                <td className="px-4 py-3 text-[#F5F0E8]">{c._count.orders}</td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs whitespace-nowrap">
                  {new Date(c.createdAt).toLocaleDateString("en-ZA")}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 border ${c.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(c.id, c.isActive)} disabled={toggling === c.id}
                    className={`text-xs hover:underline transition-colors ${c.isActive ? "text-red-400 hover:text-red-300" : "text-[#C9A84C] hover:text-[#E2C97E]"}`}>
                    {toggling === c.id ? "…" : c.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}