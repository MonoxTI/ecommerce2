"use client";
// app/admin/cards/page.tsx
// Admin page to manage Shop by Type cards (the 3 category cards on the homepage)

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
  title:    "",
  subtitle: "",
  href:     "/shop",
  imageUrl: "",
  order:    0,
  active:   true,
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

function Inp({ label, value, onChange, placeholder, helper }: {
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

function CollectionCard({
  card, onSave, onDelete,
}: {
  card: Collection;
  onSave: (id: string, data: Partial<Collection>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState(card);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  async function save() {
    setSaving(true); setError("");
    const { ok, error } = await apiFetch(`/api/admin/cards/${card.id}`, {
      method: "PATCH", body: JSON.stringify(form),
    });
    setSaving(false);
    if (!ok) return setError(error ?? "Failed to save");
    onSave(card.id, form);
    setEditing(false);
  }

  async function toggleActive() {
    await apiFetch(`/api/admin/cards/${card.id}`, {
      method: "PATCH", body: JSON.stringify({ active: !card.active }),
    });
    onSave(card.id, { active: !card.active });
  }

  if (!editing) return (
    <div className={`bg-[#111111] border ${card.active ? "border-white/[0.06]" : "border-red-800/20"} overflow-hidden`}>
      {/* Preview image */}
      <div className="relative aspect-[16/7] overflow-hidden bg-[#1A1A1A]">
        {card.imageUrl
          ? <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-xs uppercase tracking-widest">No Image</div>
        }
        {!card.active && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white/60 text-xs tracking-widest uppercase">Hidden from homepage</span>
          </div>
        )}
        {/* Order badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1">
          Position {card.order + 1}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-serif text-xl text-[#F5F0E8] font-light mb-1">{card.title || "Untitled"}</h3>
        <p className="text-[#6B6B6B] text-sm mb-1">{card.subtitle || "No subtitle"}</p>
        <p className="text-[#6B6B6B] text-xs mb-4">Links to: <span className="text-[#C9A84C]">{card.href}</span></p>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setEditing(true)}
            className="flex-1 py-2 text-xs border border-white/[0.08] text-[#6B6B6B] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors uppercase tracking-wider">
            Edit
          </button>
          <button onClick={toggleActive}
            className={`flex-1 py-2 text-xs border transition-colors uppercase tracking-wider ${
              card.active
                ? "border-yellow-800/20 text-yellow-400/60 hover:text-yellow-400 hover:border-yellow-800/40"
                : "border-green-800/20 text-green-400/60 hover:text-green-400 hover:border-green-800/40"
            }`}>
            {card.active ? "Hide" : "Show"}
          </button>
          <button onClick={() => { if (confirm(`Delete "${card.title}"?`)) onDelete(card.id); }}
            className="py-2 px-3 text-xs border border-red-800/20 text-red-400/40 hover:text-red-400 hover:border-red-800/50 transition-colors">
            🗑
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#111111] border border-[#C9A84C]/30 p-5 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase">Editing Card</p>
        <button onClick={() => setEditing(false)} className="text-[#6B6B6B] hover:text-[#F5F0E8] text-xl">×</button>
      </div>

      {error && <div className="px-3 py-2 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{error}</div>}

      <Inp label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))}
        placeholder="Lace Front" />
      <Inp label="Subtitle" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))}
        placeholder="Natural hairline, effortless style" />
      <Inp label="Image URL" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))}
        placeholder="https://res.cloudinary.com/..." helper="Paste a Cloudinary or any image URL" />
      <Inp label="Link (href)" value={form.href} onChange={v => setForm(f => ({ ...f, href: v }))}
        placeholder="/shop?category=lace-front-wigs" helper="Where this card links to when clicked" />
      <div>
        <label className="block text-[#6B6B6B] text-xs tracking-[0.14em] uppercase mb-1.5">Position (order)</label>
        <input type="number" min={0} value={form.order}
          onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
          className="w-24 bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors"
        />
        <p className="text-[#6B6B6B] text-xs mt-1">0 = first, 1 = second, 2 = third</p>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
          className="accent-[#C9A84C] w-4 h-4" />
        <span className="text-[#F5F0E8] text-sm">Show on homepage</span>
      </label>

      {/* Live preview */}
      {form.imageUrl && (
        <div>
          <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Preview</p>
          <div className="relative aspect-[16/7] overflow-hidden bg-[#1A1A1A]">
            <img src={form.imageUrl} alt={form.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="block text-white/80 text-[0.65rem] tracking-[0.25em] uppercase mb-1">{form.subtitle}</span>
              <h3 className="font-serif text-white text-2xl font-light">{form.title || "Title"}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={save} disabled={saving}
          className="flex-1 bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button onClick={() => setEditing(false)}
          className="text-[#6B6B6B] hover:text-[#F5F0E8] px-4 text-xs uppercase tracking-wider transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCollectionsPage() {
  const [cards, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showAdd, setShowAdd]         = useState(false);
  const [newForm, setNewForm]         = useState({ ...EMPTY });
  const [adding, setAdding]           = useState(false);

  useEffect(() => {
    async function init() {
      const { ok, data, error } = await apiFetch("/api/admin/cards");
      if (ok && Array.isArray(data)) setCollections(data);
      else if (error) setError(error);
      setLoading(false);
    }
    init();
  }, []);

  function updateCollection(id: string, data: Partial<Collection>) {
    setCollections(cs => cs.map(c => c.id === id ? { ...c, ...data } : c));
  }

  async function deleteCollection(id: string) {
    await apiFetch(`/api/admin/cards/${id}`, { method: "DELETE" });
    setCollections(cs => cs.filter(c => c.id !== id));
  }

  async function addCollection() {
    if (!newForm.title || !newForm.imageUrl) {
      setError("Title and Image URL are required");
      return;
    }
    setAdding(true); setError("");
    const { ok, data, error } = await apiFetch("/api/admin/cards", {
      method: "POST", body: JSON.stringify(newForm),
    });
    setAdding(false);
    if (!ok) return setError(error ?? "Failed to create");
    setCollections(cs => [...cs, data]);
    setNewForm({ ...EMPTY });
    setShowAdd(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Shop by Type</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">
            The category cards shown in the 'Shop by Type' section on the homepage. Add up to 4. Changes go live immediately after saving.
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-4 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors">
          + Add Shop by Type
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{error}</div>}

      {/* Add new form */}
      {showAdd && (
        <div className="bg-[#111111] border border-[#C9A84C]/30 p-5 mb-6 space-y-4">
          <p className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase">New Shop by Type Card</p>
          <Inp label="Title *" value={newForm.title} onChange={v => setNewForm(f => ({ ...f, title: v }))}
            placeholder="HD Lace" />
          <Inp label="Subtitle" value={newForm.subtitle} onChange={v => setNewForm(f => ({ ...f, subtitle: v }))}
            placeholder="Undetectable. Unmatched." />
          <Inp label="Image URL *" value={newForm.imageUrl} onChange={v => setNewForm(f => ({ ...f, imageUrl: v }))}
            placeholder="https://..." helper="Upload to Cloudinary or Imgur first, then paste the URL here" />
          <Inp label="Link" value={newForm.href} onChange={v => setNewForm(f => ({ ...f, href: v }))}
            placeholder="/shop?category=hd-lace-wigs" />

          {newForm.imageUrl && (
            <div className="relative aspect-[16/7] overflow-hidden bg-[#1A1A1A]">
              <img src={newForm.imageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="block text-white/80 text-[0.65rem] tracking-widest uppercase mb-1">{newForm.subtitle}</span>
                <h3 className="font-serif text-white text-2xl font-light">{newForm.title || "Title"}</h3>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={addCollection} disabled={adding}
              className="flex-1 bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors disabled:opacity-60">
              {adding ? "Creating…" : "Create Card"}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="text-[#6B6B6B] hover:text-[#F5F0E8] px-4 text-xs uppercase tracking-wider transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collections grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-[#111111] h-64 animate-pulse" />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06]">
          <p className="text-[#6B6B6B] mb-4">No cards yet</p>
          <p className="text-[#6B6B6B] text-sm mb-6">The homepage will use the default hardcoded cards until you add some here.</p>
          <button onClick={() => setShowAdd(true)}
            className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-6 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors">
            Add First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards
            .sort((a, b) => a.order - b.order)
            .map(c => (
              <CollectionCard
                key={c.id}
                card={c}
                onSave={updateCollection}
                onDelete={deleteCollection}
              />
            ))
          }
        </div>
      )}

      <div className="mt-8 p-4 bg-[#111111] border border-white/[0.06] text-sm text-[#6B6B6B]">
        <p className="font-medium text-[#F5F0E8] mb-2">How it works</p>
        <ul className="space-y-1">
          <li>— Changes save instantly — no need to redeploy</li>
          <li>— If no cards exist here, the homepage shows 4 default cards</li>
          <li>— Use Position to control left-to-right order (0 = first)</li>
          <li>— Hide a card to remove it from homepage without deleting it</li>
          <li>— For images: upload to <a href="https://cloudinary.com" target="_blank" className="text-[#C9A84C] hover:underline">cloudinary.com</a> (free) and paste the URL</li>
        </ul>
      </div>
    </div>
  );
}