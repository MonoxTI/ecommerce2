"use client";
// app/account/profile/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi, Address } from "@/lib/api";

// ─── HELPERS ──────────────────────────────────────────────────

async function apiFetch(path: string, options: RequestInit = {}, token: string) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers ?? {}) },
    credentials: "include",
  });
  const json = await res.json();
  return { ok: res.ok, data: json.data ?? json, error: json.error };
}

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

const EMPTY_ADDR = {
  fullName: "", phone: "", street: "", city: "",
  province: "", postalCode: "", country: "South Africa",
};

// ─── ADDRESS FORM ─────────────────────────────────────────────

function AddressForm({
  initial, onSave, onCancel, loading,
}: {
  initial: typeof EMPTY_ADDR;
  onSave:  (data: typeof EMPTY_ADDR) => void;
  onCancel: () => void;
  loading:  boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const fields: [keyof typeof EMPTY_ADDR, string, string, string][] = [
    ["fullName",   "Full Name",     "text", "Jane Doe"],
    ["phone",      "Phone",         "tel",  "0821234567"],
    ["street",     "Street Address","text", "123 Main Street"],
    ["city",       "City",          "text", "Johannesburg"],
    ["postalCode", "Postal Code",   "text", "2000"],
    ["country",    "Country",       "text", "South Africa"],
  ];

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(([key, label, type, ph]) => (
          <div key={key} className={key === "street" ? "sm:col-span-2" : ""}>
            <label className="block text-[#6B6B6B] text-xs tracking-[0.14em] uppercase mb-1.5">{label}</label>
            <input
              type={type} required value={form[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={ph}
              className="w-full bg-[#0A0A0A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B]"
            />
          </div>
        ))}
        <div>
          <label className="block text-[#6B6B6B] text-xs tracking-[0.14em] uppercase mb-1.5">Province</label>
          <select value={form.province} onChange={e => set("province", e.target.value)} required
            className="w-full bg-[#0A0A0A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors">
            <option value="">Select province…</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-5 py-2.5 text-xs tracking-[0.12em] uppercase font-medium transition-colors disabled:opacity-60">
          {loading ? "Saving…" : "Save Address"}
        </button>
        <button type="button" onClick={onCancel}
          className="text-[#6B6B6B] hover:text-[#F5F0E8] px-4 py-2.5 text-xs tracking-[0.12em] uppercase transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── ADDRESS CARD ─────────────────────────────────────────────

function AddressCard({ address, onEdit, onDelete, deleting }: {
  address:  Address;
  onEdit:   (a: Address) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div className="border border-white/[0.06] p-4 bg-[#0D0D0D] group hover:border-white/[0.12] transition-colors">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[#F5F0E8] text-sm font-medium">{address.fullName}</p>
          <p className="text-[#6B6B6B] text-xs mt-1 leading-relaxed">
            {address.street}<br />
            {address.city}, {address.province} {address.postalCode}<br />
            {address.country}
          </p>
          <p className="text-[#6B6B6B] text-xs mt-1">{address.phone}</p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={() => onEdit(address)}
            className="text-[#C9A84C] text-xs tracking-widest uppercase hover:underline transition-colors">
            Edit
          </button>
          <button onClick={() => onDelete(address.id)} disabled={deleting}
            className="text-red-400/50 hover:text-red-400 text-xs tracking-widest uppercase transition-colors disabled:opacity-30">
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────

export default function ProfilePage() {
  const router  = useRouter();
  const { user, getValidToken, logout } = useAuthStore();

  // Password
  const [pwForm, setPwForm]       = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses]     = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [savingAddr, setSavingAddr]   = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [addrError, setAddrError]     = useState("");

  // Load addresses on mount
  useEffect(() => {
    async function load() {
      const token = await getValidToken();
      if (!token) return;
      const { data } = await apiFetch("/api/addresses", {}, token);
      if (Array.isArray(data)) setAddresses(data);
      setAddrLoading(false);
    }
    load();
  }, []);

  // ── Password ──────────────────────────────────────────────

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirm) return setPwError("Passwords do not match");
    const token = await getValidToken();
    if (!token) return;
    setPwLoading(true);
    const { error } = await authApi.changePassword(
      { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }, token
    );
    setPwLoading(false);
    if (error) return setPwError(error);
    setPwSuccess("Password changed. Signing you out…");
    setTimeout(() => { logout(); router.push("/auth/login"); }, 2000);
  }

  // ── Addresses ────────────────────────────────────────────

  async function handleSaveAddress(formData: typeof EMPTY_ADDR) {
    setSavingAddr(true); setAddrError("");
    const token = await getValidToken();
    if (!token) return setSavingAddr(false);

    if (editingAddr) {
      // Update existing
      const { ok, data, error } = await apiFetch(
        `/api/addresses/${editingAddr.id}`,
        { method: "PATCH", body: JSON.stringify(formData) }, token
      );
      setSavingAddr(false);
      if (!ok) return setAddrError(error ?? "Failed to update address");
      setAddresses(prev => prev.map(a => a.id === editingAddr.id ? data : a));
      setEditingAddr(null);
    } else {
      // Create new
      const { ok, data, error } = await apiFetch(
        "/api/addresses",
        { method: "POST", body: JSON.stringify(formData) }, token
      );
      setSavingAddr(false);
      if (!ok) return setAddrError(error ?? "Failed to add address");
      setAddresses(prev => [data, ...prev]);
      setShowAddForm(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm("Delete this address?")) return;
    setDeletingId(id); setAddrError("");
    const token = await getValidToken();
    if (!token) return setDeletingId(null);
    const { ok, error } = await apiFetch(`/api/addresses/${id}`, { method: "DELETE" }, token);
    setDeletingId(null);
    if (!ok) return setAddrError(error ?? "Failed to delete address");
    setAddresses(prev => prev.filter(a => a.id !== id));
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-white/[0.06]">
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">My Account</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Profile</h1>
        </div>

        {/* Nav */}
        <div className="flex gap-6 mb-10 text-xs tracking-widest uppercase border-b border-white/[0.06] pb-4">
          {[["Orders", "/account/orders"], ["Profile", "/account/profile"]].map(([label, href]) => (
            <Link key={label} href={href}
              className={`pb-4 -mb-4 border-b-2 transition-colors ${
                href === "/account/profile"
                  ? "border-[#C9A84C] text-[#C9A84C]"
                  : "border-transparent text-[#6B6B6B] hover:text-[#F5F0E8]"
              }`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="space-y-6">

          {/* ── Account info ───────────────────────────────── */}
          <div className="bg-[#111111] border border-white/[0.06] p-6">
            <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-5">Account Details</h2>
            <div className="space-y-0 divide-y divide-white/[0.06]">
              {[
                ["Name",         user?.name],
                ["Email",        user?.email],
                ["Phone",        user?.phone],
                ["Role",         user?.role],
                ["Member Since", user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-ZA", { month: "long", year: "numeric" })
                  : "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-3">
                  <span className="text-[#6B6B6B] text-xs tracking-widest uppercase">{label}</span>
                  <span className="text-[#F5F0E8] text-sm">{val ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Shipping Addresses ─────────────────────────── */}
          <div className="bg-[#111111] border border-white/[0.06] p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-serif text-xl text-[#F5F0E8] font-light">Shipping Addresses</h2>
              {!showAddForm && !editingAddr && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-[#C9A84C] text-xs tracking-[0.12em] uppercase hover:underline transition-colors">
                  + Add Address
                </button>
              )}
            </div>

            {addrError && (
              <div className="mb-4 px-3 py-2 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">
                {addrError}
              </div>
            )}

            {/* Add new form */}
            {showAddForm && (
              <div className="mb-5 p-4 border border-[#C9A84C]/20 bg-[#0D0D0D]">
                <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase mb-4">New Address</p>
                <AddressForm
                  initial={EMPTY_ADDR}
                  onSave={handleSaveAddress}
                  onCancel={() => setShowAddForm(false)}
                  loading={savingAddr}
                />
              </div>
            )}

            {/* Edit form */}
            {editingAddr && (
              <div className="mb-5 p-4 border border-[#C9A84C]/20 bg-[#0D0D0D]">
                <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase mb-4">Edit Address</p>
                <AddressForm
                  initial={{
                    fullName:   editingAddr.fullName,
                    phone:      editingAddr.phone,
                    street:     editingAddr.street,
                    city:       editingAddr.city,
                    province:   editingAddr.province,
                    postalCode: editingAddr.postalCode,
                    country:    editingAddr.country,
                  }}
                  onSave={handleSaveAddress}
                  onCancel={() => setEditingAddr(null)}
                  loading={savingAddr}
                />
              </div>
            )}

            {/* Address list */}
            {addrLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-24 bg-white/[0.03] animate-pulse" />)}
              </div>
            ) : addresses.length === 0 && !showAddForm ? (
              <div className="text-center py-8 border border-dashed border-white/[0.06]">
                <p className="text-[#6B6B6B] text-sm mb-3">No addresses saved yet</p>
                <button onClick={() => setShowAddForm(true)}
                  className="text-[#C9A84C] text-xs tracking-[0.12em] uppercase hover:underline">
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={a => { setEditingAddr(a); setShowAddForm(false); }}
                    onDelete={handleDeleteAddress}
                    deleting={deletingId === addr.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Change Password ────────────────────────────── */}
          <div className="bg-[#111111] border border-white/[0.06] p-6">
            <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-5">Change Password</h2>

            {pwError   && <div className="mb-4 px-3 py-2 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{pwError}</div>}
            {pwSuccess && <div className="mb-4 px-3 py-2 bg-green-950/40 border border-green-800/50 text-green-400 text-sm">{pwSuccess}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                ["Current Password",     "currentPassword"],
                ["New Password",         "newPassword"],
                ["Confirm New Password", "confirm"],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">{label}</label>
                  <input type="password" required
                    value={pwForm[key as keyof typeof pwForm]}
                    onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              ))}
              <button type="submit" disabled={pwLoading}
                className="w-full bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60">
                {pwLoading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>

          {/* Sign out */}
          <div className="flex justify-end">
            <button onClick={handleLogout}
              className="border border-red-800/40 text-red-400 hover:bg-red-950/30 px-6 py-2 text-xs tracking-widest uppercase transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}