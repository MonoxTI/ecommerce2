"use client";
// app/admin/services/page.tsx

import { useState, useEffect } from "react";

interface Service {
  id: string; name: string; description: string;
  duration: number; price: number; category: string; active: boolean;
}
interface Availability {
  id: string; dayOfWeek: number; startTime: string; endTime: string; active: boolean;
}
interface Appointment {
  id: string; date: string; startTime: string; endTime: string;
  status: string; notes?: string;
  service: { name: string; duration: number; price: number };
  user: { name: string; email: string; phone?: string };
}

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const CATEGORIES = [
  { value: "installation", label: "Wig Installation" },
  { value: "makeup",       label: "Makeup" },
  { value: "wig-care",     label: "Wig Care" },
];
const STATUS_COLORS: Record<string,string> = {
  PENDING:   "border-yellow-800/30 text-yellow-400",
  CONFIRMED: "border-green-800/30 text-green-400",
  CANCELLED: "border-red-800/30 text-red-400/70",
  COMPLETED: "border-white/[0.08] text-[#6B6B6B]",
};

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    credentials: "include",
  });
  let json: any = {};
  try { const t = await res.text(); json = t ? JSON.parse(t) : {}; } catch {}
  return { ok: res.ok, data: json.data ?? json, error: json.error };
}

function FL({ children }: { children: React.ReactNode }) {
  return <label className="block text-[#6B6B6B] text-xs tracking-[0.14em] uppercase mb-1.5">{children}</label>;
}
function Inp({ className = "", ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] ${className}`} />;
}
function GoldBtn({ className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] text-xs tracking-[0.12em] uppercase font-medium px-4 py-2.5 transition-colors disabled:opacity-50 ${className}`} />;
}
function OutlineBtn({ className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 text-xs tracking-[0.12em] uppercase font-medium px-4 py-2.5 transition-colors disabled:opacity-50 ${className}`} />;
}

// ─── SERVICES TAB ─────────────────────────────────────────────

function ServicesTab() {
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError]         = useState("");

  const EMPTY = { name: "", description: "", duration: 60, price: 0, category: "installation", active: true };
  const [form, setForm] = useState({ ...EMPTY });
  useEffect(() => {
    api("/api/admin/services").then(({ data }) => {
      if (Array.isArray(data)) setServices(data);
      setLoading(false);
    });
  }, []);

  async function save() {
    setError("");
    const payload = { ...form, price: Math.round(Number(form.price) * 100), duration: Number(form.duration) };
    if (editingId) {
      const { ok, error } = await api(`/api/admin/services/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
      if (!ok) return setError(error ?? "Failed");
      setServices(ss => ss.map(s => s.id === editingId ? { ...s, ...payload } : s));
      setEditingId(null);
    } else {
      const { ok, data, error } = await api("/api/admin/services", { method: "POST", body: JSON.stringify(payload) });
      if (!ok) return setError(error ?? "Failed");
      setServices(ss => [...ss, data]);
      setShowAdd(false);
    }
    setForm({ ...EMPTY });
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await api(`/api/admin/services/${id}`, { method: "DELETE" });
    setServices(ss => ss.filter(s => s.id !== id));
  }

  async function toggle(id: string, active: boolean) {
    await api(`/api/admin/services/${id}`, { method: "PATCH", body: JSON.stringify({ active: !active }) });
    setServices(ss => ss.map(s => s.id === id ? { ...s, active: !active } : s));
  }

  function startEdit(svc: Service) {
    setForm({ ...svc, price: svc.price / 100 } as any);
    setEditingId(svc.id);
    setShowAdd(false);
  }

  // Form panel rendered inline (not as nested component) to prevent focus loss on keystroke
  const renderForm = () => (
    <div className="bg-[#111111] border border-[#C9A84C]/30 p-5 mb-5 space-y-4">
      <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase">
        {editingId ? "Editing Service" : "New Service"}
      </p>
      {error && <div className="px-3 py-2 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FL>Service Name *</FL>
          <Inp value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Wig Installation" />
        </div>
        <div>
          <FL>Category *</FL>
          <select value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <FL>Duration (minutes) *</FL>
          <Inp type="number" min={15} step={15} value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value as any }))}
            placeholder="60" />
        </div>
        <div>
          <FL>Price (R) *</FL>
          <Inp type="number" min={0} value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value as any }))}
            placeholder="350" />
        </div>
        <div className="md:col-span-2">
          <FL>Description</FL>
          <textarea value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What's included in this service…" rows={3}
            className="w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] resize-none"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.active}
            onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
            className="accent-[#C9A84C] w-4 h-4" />
          <span className="text-[#F5F0E8] text-sm">Active (visible to customers)</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <GoldBtn onClick={save}>{editingId ? "Save Changes" : "Create Service"}</GoldBtn>
        <button onClick={() => { setShowAdd(false); setEditingId(null); setForm({ ...EMPTY }); }}
          className="text-[#6B6B6B] hover:text-[#F5F0E8] text-xs uppercase tracking-wider transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-[#6B6B6B] text-sm">{services.length} services</p>
        {!showAdd && !editingId && <GoldBtn onClick={() => setShowAdd(true)}>+ Add Service</GoldBtn>}
      </div>
      {(showAdd || editingId) && renderForm()}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/[0.04] animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/[0.06]">
          <p className="text-[#6B6B6B] mb-4">No services yet</p>
          <GoldBtn onClick={() => setShowAdd(true)}>Add First Service</GoldBtn>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(svc => (
            <div key={svc.id} className={`bg-[#111111] border p-4 flex justify-between items-start gap-4 ${svc.active ? "border-white/[0.06]" : "border-red-800/20"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[#F5F0E8] font-medium text-sm">{svc.name}</p>
                  <span className="text-[0.6rem] tracking-widest uppercase text-[#C9A84C] border border-[#C9A84C]/30 px-1.5 py-0.5">
                    {CATEGORIES.find(c => c.value === svc.category)?.label ?? svc.category}
                  </span>
                  {!svc.active && <span className="text-[0.6rem] tracking-widest uppercase text-red-400 border border-red-800/30 px-1.5 py-0.5">Hidden</span>}
                </div>
                <p className="text-[#6B6B6B] text-xs">{svc.description}</p>
                <p className="text-[#6B6B6B] text-xs mt-1">{svc.duration} min · {formatPrice(svc.price)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(svc)} className="py-1.5 px-3 text-xs border border-white/[0.06] text-[#6B6B6B] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors uppercase">Edit</button>
                <button onClick={() => toggle(svc.id, svc.active)}
                  className={`py-1.5 px-3 text-xs border transition-colors uppercase ${svc.active ? "border-yellow-800/20 text-yellow-400/60 hover:text-yellow-400" : "border-green-800/20 text-green-400/60 hover:text-green-400"}`}>
                  {svc.active ? "Hide" : "Show"}
                </button>
                <button onClick={() => remove(svc.id, svc.name)} className="py-1.5 px-3 text-xs border border-red-800/20 text-red-400/40 hover:text-red-400 hover:border-red-800/50 transition-colors">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AVAILABILITY TAB ─────────────────────────────────────────

function AvailabilityTab() {
  const [slots, setSlots]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [mode, setMode]       = useState<"recurring" | "specific">("recurring");
  const [form, setForm]       = useState({ dayOfWeek: 1, specificDate: "", startTime: "09:00", endTime: "17:00" });
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api("/api/admin/availability").then(({ data }) => {
      if (Array.isArray(data)) setSlots(data);
      setLoading(false);
    });
  }, []);

  async function add() {
    setSaving(true);
    const payload = mode === "recurring"
      ? { dayOfWeek: form.dayOfWeek, specificDate: null, startTime: form.startTime, endTime: form.endTime, active: true }
      : { dayOfWeek: null, specificDate: form.specificDate, startTime: form.startTime, endTime: form.endTime, active: true };
    const { ok, data } = await api("/api/admin/availability", { method: "POST", body: JSON.stringify(payload) });
    setSaving(false);
    if (ok) { setSlots(ss => [...ss, data]); setShowAdd(false); }
  }

  async function toggle(id: string, active: boolean) {
    await api(`/api/admin/availability/${id}`, { method: "PATCH", body: JSON.stringify({ active: !active }) });
    setSlots(ss => ss.map((s: any) => s.id === id ? { ...s, active: !active } : s));
  }

  async function remove(id: string) {
    if (!confirm("Remove this availability slot?")) return;
    await api(`/api/admin/availability/${id}`, { method: "DELETE" });
    setSlots(ss => ss.filter((s: any) => s.id !== id));
  }

  const recurring = slots.filter((s: any) => !s.specificDate);
  const specific  = slots.filter((s: any) => s.specificDate);

  const SlotRow = ({ slot }: { slot: any }) => (
    <div className={`bg-[#111111] border p-4 flex justify-between items-center gap-4 ${slot.active ? "border-white/[0.06]" : "border-red-800/20"}`}>
      <div className="flex items-center gap-6 flex-wrap">
        <p className="text-[#F5F0E8] text-sm font-medium min-w-[120px]">
          {slot.specificDate
            ? new Date(slot.specificDate + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
            : DAYS[slot.dayOfWeek]}
        </p>
        <p className="text-[#6B6B6B] text-sm">{slot.startTime} — {slot.endTime}</p>
        {!slot.active && <span className="text-[0.6rem] tracking-widest uppercase text-red-400 border border-red-800/30 px-1.5 py-0.5">Off</span>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => toggle(slot.id, slot.active)}
          className={`py-1.5 px-3 text-xs border transition-colors uppercase ${slot.active ? "border-yellow-800/20 text-yellow-400/60 hover:text-yellow-400" : "border-green-800/20 text-green-400/60 hover:text-green-400"}`}>
          {slot.active ? "Disable" : "Enable"}
        </button>
        <button onClick={() => remove(slot.id)} className="py-1.5 px-3 text-xs border border-red-800/20 text-red-400/40 hover:text-red-400 transition-colors">🗑</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-[#6B6B6B] text-sm">Set when you're available for appointments.</p>
          <p className="text-[#6B6B6B] text-xs mt-0.5">Recurring = every week on that day. Specific = one-off date only.</p>
        </div>
        <GoldBtn onClick={() => setShowAdd(!showAdd)}>+ Add Availability</GoldBtn>
      </div>

      {showAdd && (
        <div className="bg-[#111111] border border-[#C9A84C]/30 p-5 mb-5 space-y-4 mt-4">
          <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase">Add Availability</p>
          <div className="flex gap-2">
            {(["recurring", "specific"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`py-1.5 px-4 text-xs uppercase tracking-wider border transition-colors ${mode === m ? "bg-[#C9A84C] text-[#0A0A0A] border-[#C9A84C]" : "border-white/[0.08] text-[#6B6B6B] hover:text-[#F5F0E8]"}`}>
                {m === "recurring" ? "Recurring (weekly)" : "Specific Date"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mode === "recurring" ? (
              <div>
                <FL>Day of Week</FL>
                <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                  className="w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors">
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <FL>Specific Date</FL>
                <Inp type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  value={form.specificDate}
                  onChange={e => setForm(f => ({ ...f, specificDate: e.target.value }))} />
              </div>
            )}
            <div><FL>Start Time</FL><Inp type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
            <div><FL>End Time</FL><Inp type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <GoldBtn onClick={add} disabled={saving}>{saving ? "Saving…" : "Add"}</GoldBtn>
            <button onClick={() => setShowAdd(false)} className="text-[#6B6B6B] hover:text-[#F5F0E8] text-xs uppercase tracking-wider">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 mt-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-white/[0.04] animate-pulse" />)}</div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/[0.06] mt-4">
          <p className="text-[#6B6B6B] mb-2">No availability set</p>
          <p className="text-[#6B6B6B] text-xs">Customers won't be able to book until you add your available hours.</p>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {recurring.length > 0 && (
            <div>
              <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Recurring — Every Week</p>
              <div className="space-y-2">
                {[...recurring].sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek).map((slot: any) => (
                  <SlotRow key={slot.id} slot={slot} />
                ))}
              </div>
            </div>
          )}
          {specific.length > 0 && (
            <div>
              <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Specific Dates</p>
              <div className="space-y-2">
                {[...specific].sort((a: any, b: any) => a.specificDate > b.specificDate ? 1 : -1).map((slot: any) => (
                  <SlotRow key={slot.id} slot={slot} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── APPOINTMENTS TAB ─────────────────────────────────────────

function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");
  const [updating, setUpdating]         = useState<string | null>(null);

  useEffect(() => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    api(`/api/admin/appointments${params}`).then(({ data }) => {
      if (Array.isArray(data)) setAppointments(data);
      setLoading(false);
    });
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const { ok } = await api(`/api/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    setUpdating(null);
    if (ok) setAppointments(as => as.map(a => a.id === id ? { ...a, status } : a));
  }

  const statuses = ["all", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`py-1.5 px-3 text-xs border uppercase tracking-wider transition-colors ${
              filter === s ? "bg-[#C9A84C] text-[#0A0A0A] border-[#C9A84C]" : "border-white/[0.06] text-[#6B6B6B] hover:text-[#F5F0E8]"
            }`}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.04] animate-pulse" />)}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/[0.06]">
          <p className="text-[#6B6B6B]">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(appt => (
            <div key={appt.id} className="bg-[#111111] border border-white/[0.06] p-4">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <p className="text-[#F5F0E8] font-medium text-sm">{appt.service.name}</p>
                    <span className={`text-[0.6rem] tracking-widest uppercase px-1.5 py-0.5 border ${STATUS_COLORS[appt.status] ?? "border-white/[0.08] text-[#6B6B6B]"}`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-[#6B6B6B] text-xs">
                    {new Date(appt.date).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    {" "} · {appt.startTime} – {appt.endTime}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <p className="text-[#6B6B6B] text-xs">👤 {appt.user.name}</p>
                    <p className="text-[#6B6B6B] text-xs">✉ {appt.user.email}</p>
                    {appt.user.phone && <p className="text-[#6B6B6B] text-xs">📱 {appt.user.phone}</p>}
                  </div>
                  {appt.notes && <p className="text-[#6B6B6B] text-xs mt-2 italic">"{appt.notes}"</p>}
                </div>
                {/* Status actions */}
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  {appt.status === "PENDING" && (
                    <>
                      <OutlineBtn onClick={() => updateStatus(appt.id, "CONFIRMED")} disabled={updating === appt.id}>Confirm</OutlineBtn>
                      <button onClick={() => updateStatus(appt.id, "CANCELLED")} disabled={updating === appt.id}
                        className="py-1.5 px-3 text-xs border border-red-800/20 text-red-400/60 hover:text-red-400 transition-colors uppercase">
                        Cancel
                      </button>
                    </>
                  )}
                  {appt.status === "CONFIRMED" && (
                    <GoldBtn onClick={() => updateStatus(appt.id, "COMPLETED")} disabled={updating === appt.id}>
                      Mark Complete
                    </GoldBtn>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────

export default function AdminServicesPage() {
  const [tab, setTab] = useState<"services" | "availability" | "appointments">("services");

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Services & Bookings</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">Manage your services, availability, and customer appointments.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-white/[0.06] mb-6">
        {[
          { key: "services" as const,      label: "Services" },
          { key: "availability" as const,  label: "Availability" },
          { key: "appointments" as const,  label: "Appointments" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`py-3 mr-6 text-xs tracking-[0.12em] uppercase border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-[#6B6B6B] hover:text-[#F5F0E8]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "services"     && <ServicesTab />}
      {tab === "availability" && <AvailabilityTab />}
      {tab === "appointments" && <AppointmentsTab />}
    </div>
  );
}