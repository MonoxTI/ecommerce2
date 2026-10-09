"use client";
// app/shop/page.tsx

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { productsApi, cartApi, Product, Category } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

// ─── HELPERS ─────────────────────────────────────────────────

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

// Shows the lengths a product comes in, e.g. 18" or 12" – 26"
function lengthLabel(product: Product): string | null {
  const nums = [...new Set(product.variants.map(v => v.length).filter((l): l is string => !!l))]
    .sort((a, b) => parseFloat(a) - parseFloat(b));
  if (nums.length === 0) return null;
  return nums.length === 1 ? `${nums[0]}"` : `${nums[0]}" – ${nums[nums.length - 1]}"`;
}

// ─── PRODUCT CARD ─────────────────────────────────────────────
// The whole card links to /shop/[slug] so the customer can pick length,
// colour, lace etc. Products with a single variant keep a quick "Add to Bag".

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false);
  const image   = product.images[0]?.url;
  const href    = `/shop/${product.slug}`;
  const lengths = lengthLabel(product);
  const hasOptions = product.variants.length > 1;
  const slideUp = `absolute bottom-0 left-0 right-0 bg-[#2C1F14]/90 backdrop-blur-sm text-[#FAF8F5] py-3.5 text-[0.68rem] tracking-[0.2em] uppercase font-medium text-center transition-all duration-300 hover:bg-[#B8965A] ${
    hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
  }`;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F2ED]">
        <Link href={href} aria-label={`View ${product.name}`} className="block w-full h-full">
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
            : <div className="w-full h-full bg-[#E8E0D4] flex items-center justify-center text-[#C4B5A5] text-xs tracking-widest uppercase">No Image</div>
          }
        </Link>

        {/* Badge */}
        {!product.inStock && (
          <span className="absolute top-3 left-3 bg-[#8C7B6B] text-[#FAF8F5] text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1 pointer-events-none">
            Sold Out
          </span>
        )}

        {/* Slide-up action */}
        {hasOptions || !product.inStock ? (
          <Link href={href} className={slideUp}>
            {product.inStock ? "Choose Options" : "View Details"}
          </Link>
        ) : (
          <button onClick={() => onAddToCart(product)} className={slideUp}>
            Add to Bag
          </button>
        )}
      </div>

      {/* Info */}
      <Link href={href} className="block pt-4 pb-5">
        <p className="text-[#C4B5A5] text-[0.68rem] tracking-[0.15em] uppercase mb-1">
          {product.category.name}
          {lengths && ` · ${lengths}`}
        </p>
        <h3 className="font-serif text-[#2C1F14] text-lg font-light leading-tight mb-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-serif text-[#2C1F14] text-xl">
            {product.minPrice !== product.maxPrice
              ? `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}`
              : formatPrice(product.minPrice)
            }
          </span>
          {product.avgRating && (
            <span className="text-[#B8965A] text-xs">
              {"★".repeat(Math.floor(product.avgRating))}
              <span className="text-[#C4B5A5] ml-1 tracking-wider">({product.reviewCount})</span>
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

// ─── FILTER SECTION ───────────────────────────────────────────

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[#E8E0D4] pb-5 mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full mb-3"
      >
        <span className="text-[#2C1F14] text-[0.68rem] tracking-[0.18em] uppercase font-medium">{title}</span>
        <span className="text-[#B8965A] text-lg leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && children}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────

function ShopContent() {
  
  const { addItem } = useCartStore();

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch]         = useState("");
  const [sortBy, setSortBy]         = useState("newest");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeLace, setActiveLace]         = useState<string[]>([]);
  const [activeLengths, setActiveLengths]   = useState<string[]>([]);

  // Filter options come from the database (what actually exists in stock)
  const [lengthOptions, setLengthOptions]   = useState<string[]>([]);
  const [laceOptions, setLaceOptions]       = useState<string[]>([]);

  // Toast
  const [toast, setToast]           = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load categories once
  useEffect(() => {
    productsApi.getCategories().then(({ data }) => {
      if (data) setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  // Load available lengths / lace types once
  useEffect(() => {
    productsApi.getFilters().then(({ data }) => {
      if (data) {
        setLengthOptions(data.lengths ?? []);
        setLaceOptions(data.laceTypes ?? []);
      }
    });
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [page, sortBy, activeCategory, activeLace, activeLengths]);

  async function loadProducts() {
    setLoading(true);
    const params: Record<string, string> = {
      page:  String(page),
      limit: "12",
      sortBy,
    };
    if (search)         params.search   = search;
    if (activeCategory) params.category = activeCategory;
    if (activeLace.length)    params.laceType = activeLace.join(",");
    if (activeLengths.length) params.length   = activeLengths.join(",");

    const { data } = await productsApi.list(params);
    if (data) {
      setProducts(data.items);
      setTotal(data.meta.total);
      setTotalPages(data.meta.totalPages);
    }
    setLoading(false);
  }

  function toggleFilter(group: "lace" | "length", value: string) {
    const setters = { lace: setActiveLace, length: setActiveLengths };
    const getters = { lace: activeLace, length: activeLengths };
    const current = getters[group];
    setters[group](current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
    setPage(1);
  }

  function clearFilters() {
    setActiveCategory(""); setActiveLace([]); setActiveLengths([]); setSearch(""); setPage(1);
  }

  async function handleAddToCart(product: Product) {
    const firstVariant = product.variants.find(v => v.stock > 0);
    if (!firstVariant) return;
    const error = await addItem(firstVariant.id, 1);
    const msg = error ? error : `${product.name} added to bag`;
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  }

  const activeCount = activeLace.length + activeLengths.length + (activeCategory ? 1 : 0);

  return (
    <div className="bg-[#FAF8F5] min-h-screen" style={{ fontFamily: "'Jost', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');`}</style>

      <Navbar />

      {/* ── PAGE HEADER ────────────────────────────────────── */}
      <div className="pt-28 pb-10 px-6 md:px-12 border-b border-[#E8E0D4]">
        <div className="max-w-screen-xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[#C4B5A5] text-xs tracking-widest uppercase mb-4">
            <Link href="/" className="hover:text-[#B8965A] transition-colors">Home</Link>
            <span>›</span>
            <span className="text-[#8C7B6B]">Shop</span>
          </div>

          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-px bg-[#B8965A]" />
                <span className="text-[#B8965A] text-[0.65rem] tracking-[0.3em] uppercase">Curated Collection</span>
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-5xl md:text-6xl font-light text-[#2C1F14] leading-none">
                All Wigs
              </h1>
            </div>
            <p className="text-[#8C7B6B] text-sm">{total} styles</p>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ──────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="border-b border-[#E8E0D4] bg-[#FAF8F5] sticky top-[72px] z-30">
          <div className="max-w-screen-xl mx-auto px-6 md:px-12">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => { setActiveCategory(""); setPage(1); }}
                className={`px-5 py-4 text-[0.68rem] tracking-[0.18em] uppercase border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  !activeCategory
                    ? "border-[#2C1F14] text-[#2C1F14]"
                    : "border-transparent text-[#8C7B6B] hover:text-[#2C1F14]"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button key={cat.id}
                  onClick={() => { setActiveCategory(cat.slug); setPage(1); }}
                  className={`px-5 py-4 text-[0.68rem] tracking-[0.18em] uppercase border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                    activeCategory === cat.slug
                      ? "border-[#2C1F14] text-[#2C1F14]"
                      : "border-transparent text-[#8C7B6B] hover:text-[#2C1F14]"
                  }`}
                >
                  {cat.name}
                  {cat._count && <span className="ml-1.5 text-[#C4B5A5]">({cat._count.products})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-10">

        {/* ── TOOLBAR ──────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5A5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search wigs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadProducts()}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E8E0D4] bg-white text-[#2C1F14] text-sm outline-none focus:border-[#B8965A] transition-colors placeholder:text-[#C4B5A5]"
            />
          </div>

          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={clearFilters}
                className="text-[#B8965A] text-xs tracking-widest uppercase hover:text-[#2C1F14] transition-colors">
                Clear ({activeCount}) ×
              </button>
            )}
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="border border-[#E8E0D4] bg-white text-[#2C1F14] text-xs tracking-widest uppercase px-4 py-2.5 outline-none focus:border-[#B8965A] transition-colors cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Mobile filter btn */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden border border-[#E8E0D4] bg-white text-[#2C1F14] text-xs tracking-widest uppercase px-4 py-2.5 flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
              </svg>
              Filters {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>
        </div>

        {/* ── LAYOUT: SIDEBAR + GRID ────────────────────────── */}
        <div className="flex gap-10">

          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0">

            {laceOptions.length > 0 && <FilterGroup title="Lace Type">
              <div className="space-y-2.5">
                {laceOptions.map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox"
                      checked={activeLace.includes(type)}
                      onChange={() => toggleFilter("lace", type)}
                      className="accent-[#2C1F14] w-3.5 h-3.5"
                    />
                    <span className={`text-sm transition-colors ${activeLace.includes(type) ? "text-[#2C1F14] font-medium" : "text-[#8C7B6B] group-hover:text-[#2C1F14]"}`}>
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </FilterGroup>}

            {lengthOptions.length > 0 && <FilterGroup title="Length">
              <div className="flex flex-wrap gap-2">
                {lengthOptions.map(len => (
                  <button key={len}
                    onClick={() => toggleFilter("length", len)}
                    className={`w-12 py-1.5 text-xs border transition-all ${
                      activeLengths.includes(len)
                        ? "border-[#2C1F14] bg-[#2C1F14] text-[#FAF8F5]"
                        : "border-[#E8E0D4] text-[#8C7B6B] hover:border-[#2C1F14] hover:text-[#2C1F14]"
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </FilterGroup>}

          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] bg-[#E8E0D4] animate-pulse" />
                    <div className="h-4 bg-[#E8E0D4] animate-pulse mt-3 w-3/4" />
                    <div className="h-4 bg-[#E8E0D4] animate-pulse mt-2 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-3xl text-[#C4B5A5] font-light mb-4">No products found</p>
                <button onClick={clearFilters}
                  className="text-[#B8965A] text-xs tracking-widest uppercase hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-14 pt-10 border-t border-[#E8E0D4]">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-[#E8E0D4] text-[#8C7B6B] text-xs tracking-widest uppercase hover:border-[#2C1F14] hover:text-[#2C1F14] disabled:opacity-30 transition-all"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 text-sm border transition-all ${
                          p === page
                            ? "border-[#2C1F14] bg-[#2C1F14] text-[#FAF8F5]"
                            : "border-[#E8E0D4] text-[#8C7B6B] hover:border-[#2C1F14]"
                        }`}>
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-[#E8E0D4] text-[#8C7B6B] text-xs tracking-widest uppercase hover:border-[#2C1F14] hover:text-[#2C1F14] disabled:opacity-30 transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="w-72 bg-[#FAF8F5] h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#2C1F14] text-xs tracking-[0.2em] uppercase font-medium">Filters</span>
              <button onClick={() => setSidebarOpen(false)} className="text-[#8C7B6B] text-xl">×</button>
            </div>
            {laceOptions.length > 0 && <FilterGroup title="Lace Type">
              <div className="space-y-2.5">
                {laceOptions.map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={activeLace.includes(type)} onChange={() => toggleFilter("lace", type)} className="accent-[#2C1F14]" />
                    <span className="text-sm text-[#8C7B6B]">{type}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>}
            {lengthOptions.length > 0 && <FilterGroup title="Length">
              <div className="flex flex-wrap gap-2">
                {lengthOptions.map(len => (
                  <button key={len} onClick={() => toggleFilter("length", len)}
                    className={`w-12 py-1.5 text-xs border transition-all ${activeLengths.includes(len) ? "border-[#2C1F14] bg-[#2C1F14] text-[#FAF8F5]" : "border-[#E8E0D4] text-[#8C7B6B]"}`}>
                    {len}
                  </button>
                ))}
              </div>
            </FilterGroup>}
            <button onClick={() => { clearFilters(); setSidebarOpen(false); }}
              className="w-full mt-4 border border-[#E8E0D4] text-[#8C7B6B] py-3 text-xs tracking-widest uppercase hover:border-[#B8965A] hover:text-[#B8965A] transition-colors">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed bottom-8 right-8 bg-[#2C1F14] text-[#FAF8F5] px-6 py-3.5 text-sm flex items-center gap-3 z-50 transition-all duration-300 ${
        toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}>
        <span className="text-[#B8965A]">✓</span>
        {toast}
      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8965A] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}