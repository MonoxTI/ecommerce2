"use client";
// app/admin/collections/page.tsx

import { useState, useEffect } from "react";

interface Collection {
  id:       string;
  title:    string;
  subtitle: string;
  href:     string;
  imageUrl: string;
  order:    number;
  active:   boolean;
}

const EMPTY: Omit<Collection, "id"> = {
  title: "", subtitle: "", href: "/shop", imageUrl: "", order: 0, active: true,
};

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    credentials: "include",
  });
  let json: any = {};
  try { const t = await res.text(); json = t ? JSON.parse(t) : {}; } catch {}
  return { ok: res.ok, data: json.data ?? json, error: json.error };
}

function Field({ label, value, onChange, placeholder, helper }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; helper?: string;
}) {
  return (
    <div>
      <label className="block text-[#6B6B6B] text-xs tracking-[0.14em] uppercase mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B]"
      />
      {helper && <p className="text-[#6B6B6B] text-xs mt-1">{helper}</p>}
    </div>
  );
}

function Preview({ imageUrl, title, subtitle }: { imageUrl: string; title: string; subtitle: string }) {
  if (!imageUrl) return null;
  return (
    <div>
      <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Live Preview</p>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#1A1A1A]">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="block text-white/80 text-[0.65rem] tracking-[0.25em] uppercase mb-2">{subtitle}</span>
          <h3 className="font-serif text-white text-3xl font-light mb-4">{title || "Title"}</h3>
          <span className="text-white/90 text-xs tracking-[0.15em] uppercase">Shop Now →</span>
        </div>
      </div>
    </div>
  );
}

function CollectionCard({ item, onSave, onDelete }: {
  item: Collection;
  onSave: (id: string, data: Partial<Collection>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(item);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const set = (k: keyof Collection) => (v: any) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title || !form.imageUrl) return setError("Title and Image URL are required");
    setSaving(true); setError("");
    const { ok, error } = await apiFetch(`/api/admin/collections/${item.id}`, {
      method: "PATCH", body: JSON.stringify(form),
    });
    setSaving(false);
    if (!ok) return setError(error ?? "Failed to save");
    onSave(item.id, form);
    setEditing(false);
  }

  async function toggleActive() {
    const { ok } = await apiFetch(`/api/admin/collections/${item.id}`, {
      method: "PATCH", body: JSON.stringify({ active: !item.active }),
    });
    if (ok) onSave(item.id, { active: !item.active });
  }

  if (!editing) return (
    <div className={`bg-[#111111] border overflow-hidden ${item.active ? "border-white/[0.06]" : "border-red-800/20"}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#1A1A1A]">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-xs uppercase tracking-widest">No Image</div>
        }
        {!item.active && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white/70 text-xs tracking-widest uppercase">Hidden</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="block text-white/70 text-[0.6rem] tracking-widest uppercase mb-1">{item.subtitle}</span>
          <h3 className="font-serif text-white text-2xl font-light">{item.title}</h3>
        </div>
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1">
          #{item.order + 1}
        </div>
      </div>
      <div className="p-4">
        <p className="text-[#6B6B6B] text-xs mb-4">→ {item.href}</p>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)}
            className="flex-1 py-2 text-xs border border-white/[0.08] text-[#6B6B6B] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors uppercase tracking-wider">
            Edit
          </button>
          <button onClick={toggleActive}
            className={`flex-1 py-2 text-xs border transition-colors uppercase tracking-wider ${
              item.active
                ? "border-yellow-800/20 text-yellow-400/60 hover:text-yellow-400"
                : "border-green-800/20 text-green-400/60 hover:text-green-400"
            }`}>
            {item.active ? "Hide" : "Show"}
          </button>
          <button onClick={() => { if (confirm(`Delete "${item.title}"?`)) onDelete(item.id); }}
            className="py-2 px-3 text-xs border border-red-800/20 text-red-400/40 hover:text-red-400 hover:border-red-800/50 transition-colors">
            🗑
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#111111] border border-[#C9A84C]/30 p-5 space-y-4 col-span-1 md:col-span-2">
      <div className="flex justify-between items-center">
        <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase">Editing — {item.title}</p>
        <button onClick={() => { setEditing(false); setForm(item); }} className="text-[#6B6B6B] hover:text-[#F5F0E8] text-xl">×</button>
      </div>
      {error && <div className="px-3 py-2 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Field label="Title *" value={form.title} onChange={set("title")} placeholder="HD Lace" />
          <Field label="Subtitle" value={form.subtitle} onChange={set("subtitle")} placeholder="Undetectable. Unmatched." />
          <Field label="Image URL *" value={form.imageUrl} onChange={set("imageUrl")}
            placeholder="https://res.cloudinary.com/..."
            helper="Upload to Cloudinary (free) then paste URL here" />
          <Field label="Shop Link" value={form.href} onChange={set("href")}
            placeholder="/shop?category=hd-lace-wigs"
            helper="Where clicking this card takes the customer" />
          <div>
            <label className="block text-[#6B6B6B] text-xs tracking-[0.14em] uppercase mb-1.5">Position</label>
            <input type="number" min={0} max={3} value={form.order}
              onChange={e => set("order")(Number(e.target.value))}
              className="w-20 bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors"
            />
            <p className="text-[#6B6B6B] text-xs mt-1">0 = leftmost, 3 = rightmost</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => set("active")(e.target.checked)}
              className="accent-[#C9A84C] w-4 h-4" />
            <span className="text-[#F5F0E8] text-sm">Show on homepage</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving}
              className="flex-1 bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={() => { setEditing(false); setForm(item); }}
              className="text-[#6B6B6B] hover:text-[#F5F0E8] px-4 text-xs uppercase tracking-wider transition-colors">
              Cancel
            </button>
          </div>
        </div>
        <Preview imageUrl={form.imageUrl} title={form.title} subtitle={form.subtitle} />
      </div>
    </div>
  );
}

export default function AdminCollectionsPage() {
  const [items, setItems]       = useState<Collection[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [newForm, setNewForm]   = useState({ ...EMPTY });
  const [adding, setAdding]     = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/collections").then(({ ok, data, error }) => {
      if (ok && Array.isArray(data)) setItems(data);
      else if (error) setError(error);
      setLoading(false);
    });
  }, []);

  function update(id: string, data: Partial<Collection>) {
    setItems(cs => cs.map(c => c.id === id ? { ...c, ...data } : c));
  }

  async function remove(id: string) {
    await apiFetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    setItems(cs => cs.filter(c => c.id !== id));
  }

  async function add() {
    if (!newForm.title || !newForm.imageUrl) return setError("Title and Image URL are required");
    setAdding(true); setError("");
    const { ok, data, error } = await apiFetch("/api/admin/collections", {
      method: "POST", body: JSON.stringify(newForm),
    });
    setAdding(false);
    if (!ok) return setError(error ?? "Failed to create");
    setItems(cs => [...cs, data]);
    setNewForm({ ...EMPTY });
    setShowAdd(false);
  }

  const set = (k: keyof typeof EMPTY) => (v: any) => setNewForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Shop by Type</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">
            Manage the 4 category cards on the homepage. Changes go live immediately — no redeploy needed.
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-4 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors">
          + Add Card
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{error}</div>}

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#111111] border border-[#C9A84C]/30 p-5 mb-6 space-y-4">
          <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase">New Card</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Field label="Title *" value={newForm.title} onChange={set("title")} placeholder="Lace Front" />
              <Field label="Subtitle" value={newForm.subtitle} onChange={set("subtitle")} placeholder="Natural hairline, effortless style" />
              <Field label="Image URL *" value={newForm.imageUrl} onChange={set("imageUrl")}
                placeholder="https://..."
                helper="Upload to cloudinary.com (free) then paste URL" />
              <Field label="Shop Link" value={newForm.href} onChange={set("href")}
                placeholder="/shop?category=lace-front-wigs" />
              <div className="flex gap-3 pt-2">
                <button onClick={add} disabled={adding}
                  className="flex-1 bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors disabled:opacity-60">
                  {adding ? "Creating…" : "Create Card"}
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="text-[#6B6B6B] hover:text-[#F5F0E8] px-4 text-xs uppercase tracking-wider transition-colors">
                  Cancel
                </button>
              </div>
            </div>
            <Preview imageUrl={newForm.imageUrl} title={newForm.title} subtitle={newForm.subtitle} />
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-[#111111] h-80 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06]">
          <p className="text-[#6B6B6B] mb-2">No cards yet</p>
          <p className="text-[#6B6B6B] text-sm mb-6">The homepage shows 4 default cards until you add some here.</p>
          <button onClick={() => setShowAdd(true)}
            className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-6 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors">
            Add First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...items].sort((a, b) => a.order - b.order).map(c => (
            <CollectionCard key={c.id} item={c} onSave={update} onDelete={remove} />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-[#111111] border border-white/[0.06] text-sm text-[#6B6B6B]">
        <p className="font-medium text-[#F5F0E8] mb-2">How it works</p>
        <ul className="space-y-1 text-xs">
          <li>— Add up to 4 cards. Each needs a Title, Image URL, and Shop Link.</li>
          <li>— Position controls order left → right (0 = first, 3 = last)</li>
          <li>— Hide removes from homepage without deleting. Show brings it back.</li>
          <li>— If no cards exist here, homepage shows 4 default hardcoded cards.</li>
          <li>— For images: sign up free at <a href="https://cloudinary.com" target="_blank" className="text-[#C9A84C] hover:underline">cloudinary.com</a> → upload → copy URL</li>
        </ul>
      </div>
    </div>
  );
}