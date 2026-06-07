"use client";
// app/admin/products/page.tsx

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { productsApi, Product, Category } from "@/lib/api";

// ─── HELPERS ──────────────────────────────────────────────────

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function apiFetch(path: string, options: RequestInit = {}, token: string) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers ?? {}) },
    credentials: "include",
  });
  const json = await res.json();
  return { ok: res.ok, data: json.data ?? json, error: json.error };
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────

function FL({ children }: { children: React.ReactNode }) {
  return <label className="block text-[#6B6B6B] text-xs tracking-[0.14em] uppercase mb-1.5">{children}</label>;
}

function Inp({ className = "", ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] ${className}`} />;
}

function Sel({ className = "", ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={`w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors ${className}`} />;
}

function GoldBtn({ className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] text-xs tracking-[0.12em] uppercase font-medium px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`} />;
}

function OutlineBtn({ className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`inline-flex items-center gap-2 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 text-xs tracking-[0.12em] uppercase font-medium px-4 py-2.5 transition-colors disabled:opacity-50 ${className}`} />;
}

// ─── CATEGORY MODAL ───────────────────────────────────────────

function CategoryModal({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: (cat: Category) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { ok, data, error } = await apiFetch("/api/categories", { method: "POST", body: JSON.stringify({ name, slug }) }, token);
    setLoading(false);
    if (!ok) return setError(error ?? "Failed");
    onCreated(data); onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-[#111111] border border-white/[0.08] p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif text-xl text-[#F5F0E8] font-light">New Category</h3>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#F5F0E8] text-2xl leading-none">×</button>
        </div>
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <div><FL>Name</FL><Inp value={name} onChange={e => { setName(e.target.value); setSlug(slugify(e.target.value)); }} placeholder="HD Lace Wigs" required /></div>
          <div><FL>Slug</FL><Inp value={slug} onChange={e => setSlug(e.target.value)} placeholder="hd-lace-wigs" required /></div>
          <GoldBtn type="submit" disabled={loading} className="w-full justify-center">{loading ? "Creating…" : "Create Category"}</GoldBtn>
        </form>
      </div>
    </div>
  );
}

// ─── VARIANT ROW ──────────────────────────────────────────────

interface VF { id?: string; sku: string; price: string; stock: string; color: string; length: string; density: string; laceType: string; capSize: string; }
const EMPTY_V: VF = { sku: "", price: "", stock: "", color: "", length: "", density: "", laceType: "", capSize: "" };

function VariantRow({ v, i, onChange, onRemove, onSave, isSaved, token }: {
  v: VF; i: number;
  onChange: (i: number, f: keyof VF, val: string) => void;
  onRemove: (i: number) => void;
  onSave?: (i: number) => Promise<void>;
  isSaved: boolean; token: string;
}) {
  const [saving, setSaving] = useState(false);
  const [stockMode, setStockMode] = useState<"add"|"set">("add");
  const [stockQty, setStockQty] = useState("");
  const [stockLoading, setStockLoading] = useState(false);
  const [stockMsg, setStockMsg] = useState("");

  async function saveVariant() {
    if (!onSave) return;
    setSaving(true);
    await onSave(i);
    setSaving(false);
  }

  async function updateStock() {
    if (!v.id || !stockQty) return;
    setStockLoading(true);
    const { ok, data } = await apiFetch(`/api/admin/inventory/${v.id}`, {
      method: "PATCH", body: JSON.stringify({ quantity: Number(stockQty), set: stockMode === "set" }),
    }, token);
    setStockLoading(false);
    if (ok) {
      onChange(i, "stock", String(data.stock));
      setStockMsg(`✓ Stock updated to ${data.stock}`);
      setStockQty("");
      setTimeout(() => setStockMsg(""), 2500);
    }
  }

  return (
    <div className="border border-white/[0.06] bg-[#0D0D0D] p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[#C9A84C] text-xs tracking-[0.14em] uppercase">
          {v.id ? `Variant — ${v.sku || "unnamed"}` : `New Variant ${i + 1}`}
        </span>
        <button onClick={() => onRemove(i)} className="text-red-400/50 hover:text-red-400 text-xs uppercase tracking-wider transition-colors">
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {([["sku","SKU","BWL-001"],["price","Price (R)","1899"],["stock","Stock","10"],["color","Color","Natural Black"],["length",'Length"',"18"],["density","Density","150%"],["laceType","Lace Type","HD Lace"],["capSize","Cap Size","Medium"]] as [keyof VF, string, string][]).map(([field, label, ph]) => (
          <div key={field}>
            <FL>{label}</FL>
            <Inp value={v[field]} onChange={e => onChange(i, field, e.target.value)} placeholder={ph} readOnly={field === "stock" && isSaved} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
        {/* Save/update variant */}
        {onSave && (
          <OutlineBtn onClick={saveVariant} disabled={saving}>
            {saving ? "Saving…" : v.id ? "Update Variant" : "Create Variant"}
          </OutlineBtn>
        )}

        {/* Stock update (only for saved variants) */}
        {isSaved && v.id && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex border border-white/[0.06]">
              {(["add","set"] as const).map(m => (
                <button key={m} onClick={() => setStockMode(m)}
                  className={`px-3 py-1.5 text-xs tracking-widest uppercase transition-colors ${stockMode === m ? "bg-[#C9A84C] text-[#0A0A0A]" : "text-[#6B6B6B] hover:text-[#F5F0E8]"}`}>
                  {m === "add" ? "+ Add" : "= Set"}
                </button>
              ))}
            </div>
            <Inp type="number" min="1" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="Qty" className="w-20" />
            <OutlineBtn onClick={updateStock} disabled={stockLoading || !stockQty}>
              {stockLoading ? "…" : "Update Stock"}
            </OutlineBtn>
            {stockMsg && <span className="text-[#C9A84C] text-xs">{stockMsg}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IMAGE MANAGER ────────────────────────────────────────────

function ImageManager({ productId, images, token, onUpdate }: {
  productId: string; images: { id: string; url: string }[]; token: string;
  onUpdate: (imgs: { id: string; url: string }[]) => void;
}) {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [tab, setTab]         = useState<"file" | "url">("file");
  const fileRef               = useRef<HTMLInputElement>(null);

  async function addUrl() {
    if (!url.trim()) return;
    setLoading(true); setError("");
    const { ok, data, error } = await apiFetch(`/api/admin/products/${productId}/images`,
      { method: "POST", body: JSON.stringify({ url: url.trim() }) }, token);
    setLoading(false);
    if (!ok) return setError(error ?? "Failed to add image");
    onUpdate([...images, data]); setUrl("");
  }

  async function addFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      credentials: "include",
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.error ?? "Upload failed");
    onUpdate([...images, json.data]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function del(imageId: string) {
    const { ok } = await apiFetch(`/api/admin/products/${productId}/images/${imageId}`,
      { method: "DELETE" }, token);
    if (ok) onUpdate(images.filter(img => img.id !== imageId));
  }

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {images.map(img => (
            <div key={img.id} className="relative group aspect-square bg-[#1A1A1A] overflow-hidden">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => del(img.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-white/[0.06] py-8 text-center text-[#6B6B6B] text-sm">
          No images yet
        </div>
      )}

      {/* Tab switch */}
      <div className="flex border border-white/[0.06]">
        {(["file", "url"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs tracking-widest uppercase transition-colors ${
              tab === t ? "bg-[#C9A84C] text-[#0A0A0A]" : "text-[#6B6B6B] hover:text-[#F5F0E8]"
            }`}>
            {t === "file" ? "Upload File" : "Paste URL"}
          </button>
        ))}
      </div>

      {tab === "file" ? (
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={addFile} disabled={loading}
            className="block w-full text-sm text-[#6B6B6B] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:tracking-widest file:uppercase file:bg-[#C9A84C] file:text-[#0A0A0A] file:cursor-pointer hover:file:bg-[#E2C97E] file:transition-colors disabled:opacity-50"
          />
          {loading && <p className="text-[#C9A84C] text-xs mt-2">Uploading…</p>}
          <p className="text-[#6B6B6B] text-xs mt-2">JPEG, PNG, WebP or GIF — max 5MB</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Inp value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              onKeyDown={e => e.key === "Enter" && addUrl()} />
            <OutlineBtn onClick={addUrl} disabled={loading || !url} className="flex-shrink-0">
              {loading ? "…" : "+ Add"}
            </OutlineBtn>
          </div>
          <p className="text-[#6B6B6B] text-xs">Paste a URL and press Enter</p>
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ─── PRODUCT DRAWER ───────────────────────────────────────────

function ProductDrawer({ product, categories, token, onClose, onSaved }: {
  product: Product | null; categories: Category[]; token: string;
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!product;

  const [name, setName]               = useState(product?.name ?? "");
  const [slug, setSlug]               = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [brand, setBrand]             = useState(product?.brand ?? "");
  const [categoryId, setCategoryId]   = useState(product?.category.id ?? "");
  const [variants, setVariants]       = useState<VF[]>(
    product?.variants.map(v => ({
      id: v.id, sku: v.sku,
      price:    String((v.price / 100).toFixed(0)),
      stock:    String(v.stock),
      color:    v.color    ?? "",
      length:   v.length   ?? "",
      density:  v.density  ?? "",
      laceType: v.laceType ?? "",
      capSize:  v.capSize  ?? "",
    })) ?? [{ ...EMPTY_V }]
  );
  const [images, setImages]           = useState<{ id: string; url: string }[]>(product?.images ?? []);
  const [localCats, setLocalCats]     = useState<Category[]>(categories);
  const [tab, setTab]                 = useState<"info"|"variants"|"images">("info");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [showCatModal, setShowCatModal] = useState(false);

  function onNameChange(val: string) {
    setName(val);
    if (!isEdit) setSlug(slugify(val));
  }

  async function saveVariant(idx: number) {
    if (!product) return;
    const v = variants[idx];
    const body = {
      sku: v.sku,
      price:    Math.round(parseFloat(v.price || "0") * 100),
      stock:    parseInt(v.stock || "0"),
      color:    v.color    || undefined,
      length:   v.length   || undefined,
      density:  v.density  || undefined,
      laceType: v.laceType || undefined,
      capSize:  v.capSize  || undefined,
    };

    if (v.id) {
      const { ok, error } = await apiFetch(`/api/admin/products/${product.id}/variants/${v.id}`, { method: "PATCH", body: JSON.stringify(body) }, token);
      if (!ok) { setError(error ?? "Failed to update variant"); return; }
    } else {
      const { ok, data, error } = await apiFetch(`/api/admin/products/${product.id}/variants`, { method: "POST", body: JSON.stringify(body) }, token);
      if (!ok) { setError(error ?? "Failed to create variant"); return; }
      setVariants(vs => vs.map((variant, i) => i === idx ? { ...variant, id: data.id } : variant));
    }
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug || !categoryId) return setError("Name, slug and category are required");
    if (!isEdit && variants.length === 0) return setError("At least one variant is required");

    setLoading(true); setError("");

    if (isEdit) {
      const { ok, error } = await apiFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH", body: JSON.stringify({ name, slug, description, brand, categoryId }),
      }, token);
      setLoading(false);
      if (!ok) return setError(error ?? "Failed to update");
      onSaved();
    } else {
      const variantData = variants.map(v => ({
        sku:      v.sku,
        price:    Math.round(parseFloat(v.price || "0") * 100),
        stock:    parseInt(v.stock || "0"),
        color:    v.color    || undefined,
        length:   v.length   || undefined,
        density:  v.density  || undefined,
        laceType: v.laceType || undefined,
        capSize:  v.capSize  || undefined,
      }));
      const { ok, error } = await apiFetch("/api/admin/products", {
        method: "POST", body: JSON.stringify({ name, slug, description, brand, categoryId, variants: variantData }),
      }, token);
      setLoading(false);
      if (!ok) return setError(error ?? "Failed to create product");
      onSaved();
    }
  }

  const tabs = [
    { key: "info" as const,     label: "Info" },
    { key: "variants" as const, label: `Variants (${variants.length})` },
    ...(isEdit ? [{ key: "images" as const, label: `Images (${images.length})` }] : []),
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-[#0D0D0D] border-l border-white/[0.06] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-0.5">{isEdit ? "Editing" : "Creating"}</p>
            <h2 className="font-serif text-2xl text-[#F5F0E8] font-light truncate max-w-md">
              {isEdit ? product.name : "New Product"}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#F5F0E8] text-3xl leading-none transition-colors flex-shrink-0">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] px-6 flex-shrink-0">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`py-3 mr-6 text-xs tracking-[0.12em] uppercase border-b-2 -mb-px transition-colors ${
                tab === t.key ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-[#6B6B6B] hover:text-[#F5F0E8]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{error}</div>
          )}

          {/* INFO */}
          {tab === "info" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FL>Product Name *</FL>
                  <Inp value={name} onChange={e => onNameChange(e.target.value)} placeholder="Body Wave Lace Front" />
                </div>
                <div>
                  <FL>Brand</FL>
                  <Inp value={brand} onChange={e => setBrand(e.target.value)} placeholder="AuraWig" />
                </div>
              </div>

              <div>
                <FL>Slug *</FL>
                <Inp value={slug} onChange={e => setSlug(e.target.value)} placeholder="body-wave-lace-front" />
                <p className="text-[#6B6B6B] text-xs mt-1">URL: /shop/{slug || "..."}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <FL>Category *</FL>
                  <button onClick={() => setShowCatModal(true)} className="text-[#C9A84C] text-xs hover:underline">
                    + New Category
                  </button>
                </div>
                <Sel value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">Select a category…</option>
                  {localCats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Sel>
              </div>

              <div>
                <FL>Description *</FL>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe this wig…"
                  rows={5}
                  className="w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] resize-none"
                />
              </div>
            </div>
          )}

          {/* VARIANTS */}
          {tab === "variants" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[#6B6B6B] text-xs tracking-widest uppercase">{variants.length} variant{variants.length !== 1 ? "s" : ""}</p>
                <OutlineBtn onClick={() => setVariants(vs => [...vs, { ...EMPTY_V }])}>+ Add Variant</OutlineBtn>
              </div>

              {variants.length === 0 ? (
                <div className="border border-dashed border-white/[0.06] py-12 text-center">
                  <p className="text-[#6B6B6B] text-sm mb-3">No variants</p>
                  <OutlineBtn onClick={() => setVariants([{ ...EMPTY_V }])}>Add First Variant</OutlineBtn>
                </div>
              ) : (
                variants.map((v, idx) => (
                  <VariantRow
                    key={v.id ?? `new-${idx}`}
                    v={v} i={idx}
                    onChange={(i, f, val) => setVariants(vs => vs.map((item, j) => j === i ? { ...item, [f]: val } : item))}
                    onRemove={i => setVariants(vs => vs.filter((_, j) => j !== i))}
                    onSave={isEdit ? saveVariant : undefined}
                    isSaved={isEdit && !!v.id}
                    token={token}
                  />
                ))
              )}

              {!isEdit && variants.length > 0 && (
                <p className="text-[#6B6B6B] text-xs border-t border-white/[0.04] pt-3">
                  Variants will be created when you click "Create Product" below.
                </p>
              )}
            </div>
          )}

          {/* IMAGES */}
          {tab === "images" && isEdit && (
            <ImageManager
              productId={product.id}
              images={images}
              token={token}
              onUpdate={setImages}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.06] flex-shrink-0 bg-[#0A0A0A]">
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#F5F0E8] text-xs tracking-widest uppercase transition-colors">
            Cancel
          </button>
          <GoldBtn onClick={handleSubmit} disabled={loading} className="min-w-[130px] justify-center">
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </GoldBtn>
        </div>
      </div>

      {showCatModal && (
        <CategoryModal token={token} onClose={() => setShowCatModal(false)}
          onCreated={cat => { setLocalCats(cs => [...cs, cat]); setCategoryId(cat.id); }} />
      )}
    </>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────

export default function AdminProductsPage() {
  const { getValidToken }         = useAuthStore();
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [token, setToken]         = useState("");
  const [drawer, setDrawer]       = useState<"closed"|"new"|"edit">("closed");
  const [selected, setSelected]   = useState<Product | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [total, setTotal]         = useState(0);

  useEffect(() => {
    getValidToken().then(t => { if (t) setToken(t); });
  }, []);

  useEffect(() => {
    if (!token) return;
    loadProducts();
    productsApi.getCategories().then(({ data }) => {
      if (data) setCategories(Array.isArray(data) ? data : []);
    });
  }, [token]);

  async function loadProducts(q = "") {
    setLoading(true);
    const params: Record<string, string> = { limit: "50" };
    if (q) params.search = q;
    const { data } = await productsApi.list(params);
    if (data) { setProducts(data.items); setTotal(data.meta.total); }
    setLoading(false);
  }

  async function handleArchive(id: string, name: string, currentlyActive: boolean) {
    const action = currentlyActive ? "hide" : "restore";
    if (!confirm(`${currentlyActive ? "Hide" : "Restore"} "${name}"?\n\n${currentlyActive ? "It will no longer appear in the shop but order history is preserved." : "It will reappear in the shop."}`)) return;
    setDeleting(id);
    await apiFetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !currentlyActive }),
    }, token);
    setDeleting(null);
    loadProducts(search);
  }

  async function handleHardDelete(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"?\n\nThis cannot be undone. Only works if the product has no orders.`)) return;
    setDeleting(id);
    const { ok, error } = await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" }, token);
    setDeleting(null);
    if (!ok) {
      alert(error ?? "Cannot delete — this product has existing orders. Use Hide instead.");
    }
    loadProducts(search);
  }

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Admin</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Products</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">{total} total products</p>
        </div>
        <div className="flex gap-3">
          <OutlineBtn onClick={() => loadProducts(search)}>↺ Refresh</OutlineBtn>
          <GoldBtn onClick={() => { setSelected(null); setDrawer("new"); }}>+ New Product</GoldBtn>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && loadProducts(search)}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 bg-[#111111] border border-white/[0.06] text-[#F5F0E8] text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#111111] animate-pulse">
              <div className="aspect-[3/4] bg-white/[0.04]" />
              <div className="p-3 space-y-2"><div className="h-3 bg-white/[0.04] w-2/3" /><div className="h-4 bg-white/[0.04]" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/[0.06]">
          <p className="text-[#6B6B6B] mb-4">{search ? "No products match your search" : "No products yet"}</p>
          {!search && <GoldBtn onClick={() => { setSelected(null); setDrawer("new"); }}>Create First Product</GoldBtn>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-[#111111] border border-white/[0.06] overflow-hidden group hover:border-white/[0.14] transition-colors">
              <div className="aspect-[3/4] bg-[#1A1A1A] overflow-hidden relative">
                {product.images[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#6B6B6B] text-xs tracking-widest uppercase">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {(product as any).isActive === false && <span className="bg-black/80 text-white text-[0.6rem] px-1.5 py-0.5 tracking-wider uppercase">Hidden</span>}
                  {!product.inStock && (product as any).isActive !== false && <span className="bg-red-500/80 text-white text-[0.6rem] px-1.5 py-0.5 tracking-wider uppercase">Out of Stock</span>}
                  {product.inStock && product.totalStock <= 5 && <span className="bg-orange-500/80 text-white text-[0.6rem] px-1.5 py-0.5 tracking-wider uppercase">Low Stock</span>}
                </div>
              </div>
              <div className="p-3">
                <p className="text-[#6B6B6B] text-[0.65rem] tracking-wider uppercase mb-0.5">{product.category.name}</p>
                <h3 className="text-[#F5F0E8] text-sm font-medium leading-tight mb-0.5 truncate">{product.name}</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-serif text-[#C9A84C]">{formatPrice(product.minPrice)}</span>
                  <span className="text-[#6B6B6B] text-xs">{product.variants.length} var.</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setSelected(product); setDrawer("edit"); }}
                    className="flex-1 py-1.5 text-xs border border-white/[0.06] text-[#6B6B6B] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors">
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(product.id, product.name, (product as any).isActive !== false)}
                    disabled={deleting === product.id}
                    className={`flex-1 py-1.5 text-xs border transition-colors disabled:opacity-30 ${
                      (product as any).isActive === false
                        ? "border-green-800/30 text-green-400/60 hover:text-green-400 hover:border-green-800/50"
                        : "border-yellow-800/20 text-yellow-400/50 hover:text-yellow-400 hover:border-yellow-800/40"
                    }`}>
                    {deleting === product.id ? "…" : (product as any).isActive === false ? "Restore" : "Hide"}
                  </button>
                  <button onClick={() => handleHardDelete(product.id, product.name)} disabled={deleting === product.id}
                    className="py-1.5 px-2 text-xs border border-red-800/20 text-red-400/40 hover:text-red-400 hover:border-red-800/50 transition-colors disabled:opacity-30">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawer !== "closed" && token && (
        <ProductDrawer
          product={drawer === "edit" ? selected : null}
          categories={categories}
          token={token}
          onClose={() => { setDrawer("closed"); setSelected(null); }}
          onSaved={() => { setDrawer("closed"); setSelected(null); loadProducts(search); }}
        />
      )}
    </div>
  );
}