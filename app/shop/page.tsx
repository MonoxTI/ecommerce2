"use client";
// app/shop/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { productsApi, cartApi, Product, Category } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

// ─── HELPERS ─────────────────────────────────────────────────

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

const LENGTHS   = ["12", "14", "16", "18", "20", "22", "24", "26", "28"];
const LACE_TYPES = ["Lace Front", "Full Lace", "HD Lace", "4x4", "13x4"];
const COLORS     = ["Natural Black", "Jet Black", "Dark Brown", "Medium Brown", "Blonde"];

// ─── ENHANCED PRODUCT CARD ───────────────────────────────────

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const image = product.images[0]?.url;
  const badge = (product as any).tags?.[0];
 
  return (
    <div
      className="group bg-[#FAF8F5] hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/shop/${product.slug}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F2ED]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#E8E0D4] flex items-center justify-center text-[#C4B5A5] text-[0.65rem] tracking-widest uppercase">
            No Image
          </div>
        )}
 
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.inStock && (
            <span className="bg-[#8C7B6B] text-[#FAF8F5] text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1">
              Sold Out
            </span>
          )}
          {badge && (
            <span className={`text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1 font-medium ${
              badge === "New" || badge === "New Arrival"
                ? "bg-[#B8965A] text-[#2C1F14]"
                : badge === "Limited"
                  ? "bg-transparent border border-[#2C1F14] text-[#2C1F14]"
                  : "bg-[#2C1F14] text-[#FAF8F5]"
            }`}>
              {badge}
            </span>
          )}
        </div>
 
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#2C1F14]/90 via-[#2C1F14]/40 to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}>
          <span className="text-[#B8965A] text-[0.65rem] tracking-[0.12em] uppercase font-medium mb-3">
            View Details →
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // ← stops the parent div click (navigation)
              onAddToCart(product);
            }}
            disabled={!product.inStock}
            className="w-full bg-[#B8965A] hover:bg-[#D4AF6E] text-[#2C1F14] py-2.5 text-[0.65rem] tracking-[0.15em] uppercase font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.inStock ? "Add to Bag" : "Out of Stock"}
          </button>
        </div>
      </div>
 
      {/* Product Info */}
      <div className="p-4 border-t border-[#E8E0D4]">
        <p className="text-[#C4B5A5] text-[0.65rem] tracking-wider uppercase mb-1">
          {product.category.name}
          {product.variants[0]?.length && ` · ${product.variants[0].length}"`}
        </p>
        <h3
          className="font-serif text-[#2C1F14] text-lg font-light leading-tight mb-2 group-hover:text-[#B8965A] transition-colors"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-serif text-[#B8965A] text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {product.minPrice !== product.maxPrice
              ? `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}`
              : formatPrice(product.minPrice)
            }
          </span>
          {product.avgRating && (
            <span className="text-[#B8965A] text-xs flex items-center gap-0.5">
              {"★".repeat(Math.floor(product.avgRating))}
              <span className="text-[#C4B5A5] ml-1 tracking-wider">({product.reviewCount})</span>
            </span>
          )}
        </div>
      </div>
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
      {open && <div className="animate-fadeIn">{children}</div>}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────

export default function ShopPage() {
  const { token }   = useAuthStore();
  const { addItem } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch]         = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy]         = useState(searchParams.get("sort") || "newest");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [activeLace, setActiveLace]         = useState<string[]>([]);
  const [activeColors, setActiveColors]     = useState<string[]>([]);
  const [activeLengths, setActiveLengths]   = useState<string[]>([]);

  // Toast
  const [toast, setToast]           = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync URL params with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (activeCategory) params.set("category", activeCategory);
    if (page > 1) params.set("page", String(page));
    
    const newUrl = params.toString() ? `?${params.toString()}` : "/shop";
    router.replace(newUrl, { scroll: false });
  }, [search, sortBy, activeCategory, page, router]);

  // Load categories once
  useEffect(() => {
    productsApi.getCategories().then(({ data }) => {
      if (data) setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [page, sortBy, activeCategory, activeLace, activeColors, activeLengths]);

  async function loadProducts() {
    setLoading(true);
    const params: Record<string, string> = {
      page:  String(page),
      limit: "12",
      sortBy,
    };
    if (search)         params.search   = search;
    if (activeCategory) params.category = activeCategory;
    if (activeLace[0])  params.laceType = activeLace[0];
    if (activeColors[0])params.color    = activeColors[0];
    if (activeLengths[0])params.length  = activeLengths[0];

    const { data } = await productsApi.list(params);
    if (data) {
      setProducts(data.items);
      setTotal(data.meta.total);
      setTotalPages(data.meta.totalPages);
    }
    setLoading(false);
  }

  function toggleFilter(group: "lace" | "color" | "length", value: string) {
    const setters = { lace: setActiveLace, color: setActiveColors, length: setActiveLengths };
    const getters = { lace: activeLace, color: activeColors, length: activeLengths };
    const current = getters[group];
    setters[group](current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
    setPage(1);
  }

  function clearFilters() {
    setActiveCategory(""); 
    setActiveLace([]); 
    setActiveColors([]); 
    setActiveLengths([]); 
    setSearch(""); 
    setPage(1);
    router.replace("/shop");
  }

  async function handleAddToCart(product: Product) {
    const firstVariant = product.variants.find(v => v.stock > 0);
    if (!firstVariant) return;
    if (!token) { window.location.href = "/login"; return; }
    const error = await addItem(firstVariant.id, 1, token);
    const msg = error ? error : `${product.name} added to bag`;
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  }

  const activeCount = activeLace.length + activeColors.length + activeLengths.length + (activeCategory ? 1 : 0);

  return (
    <div className="bg-[#FAF8F5] min-h-screen" style={{ fontFamily: "'Jost', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');`}</style>

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
                  {cat._count?.products ? <span className="ml-1.5 text-[#C4B5A5]">({cat._count.products})</span> : null}
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

            <FilterGroup title="Lace Type">
              <div className="space-y-2.5">
                {LACE_TYPES.map(type => (
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
            </FilterGroup>

            <FilterGroup title="Color">
              <div className="space-y-2.5">
                {COLORS.map(color => (
                  <label key={color} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox"
                      checked={activeColors.includes(color)}
                      onChange={() => toggleFilter("color", color)}
                      className="accent-[#2C1F14] w-3.5 h-3.5"
                    />
                    <span className={`text-sm transition-colors ${activeColors.includes(color) ? "text-[#2C1F14] font-medium" : "text-[#8C7B6B] group-hover:text-[#2C1F14]"}`}>
                      {color}
                    </span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Length">
              <div className="flex flex-wrap gap-2">
                {LENGTHS.map(len => (
                  <button key={len}
                    onClick={() => toggleFilter("length", len)}
                    className={`w-12 py-1.5 text-xs border transition-all ${
                      activeLengths.includes(len)
                        ? "border-[#2C1F14] bg-[#2C1F14] text-[#FAF8F5]"
                        : "border-[#E8E0D4] text-[#8C7B6B] hover:border-[#2C1F14] hover:text-[#2C1F14]"
                    }`}
                  >
                    {len}"
                  </button>
                ))}
              </div>
            </FilterGroup>

          </aside>

          {/* Product Grid Container */}
          <div className="flex-1">
            {loading ? (
              // ── LOADING SKELETON ───────────────────────────
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-[#FAF8F5]">
                    <div className="aspect-[3/4] bg-[#E8E0D4] animate-pulse rounded-sm" />
                    <div className="p-4">
                      <div className="h-3 bg-[#E8E0D4] animate-pulse w-1/2 mb-2" />
                      <div className="h-4 bg-[#E8E0D4] animate-pulse w-3/4 mb-2" />
                      <div className="h-5 bg-[#E8E0D4] animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              // ── EMPTY STATE ───────────────────────────────
              <div className="text-center py-24">
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-3xl text-[#C4B5A5] font-light mb-4">No products found</p>
                <p className="text-[#8C7B6B] text-sm mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-[#B8965A] hover:bg-[#D4AF6E] text-[#2C1F14] px-6 py-3 text-[0.7rem] tracking-[0.15em] uppercase font-medium transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : (
              // ── PRODUCT GRID ──────────────────────────────
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                {/* ── PAGINATION ───────────────────────────── */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-14 pt-10 border-t border-[#E8E0D4]">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-[#E8E0D4] text-[#8C7B6B] text-[0.65rem] tracking-[0.15em] uppercase hover:border-[#2C1F14] hover:text-[#2C1F14] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ← Prev
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => {
                          // Add ellipsis for skipped pages
                          const prev = arr[idx - 1];
                          return (
                            <div key={p} className="flex items-center">
                              {prev && p - prev > 1 && (
                                <span className="px-2 text-[#C4B5A5]">…</span>
                              )}
                              <button 
                                onClick={() => setPage(p)}
                                className={`w-10 h-10 text-[0.7rem] border transition-all ${
                                  p === page
                                    ? "border-[#2C1F14] bg-[#2C1F14] text-[#FAF8F5]"
                                    : "border-[#E8E0D4] text-[#8C7B6B] hover:border-[#2C1F14] hover:text-[#2C1F14]"
                                }`}
                              >
                                {p}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                    
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-[#E8E0D4] text-[#8C7B6B] text-[0.65rem] tracking-[0.15em] uppercase hover:border-[#2C1F14] hover:text-[#2C1F14] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
                
                {/* Results Count */}
                <p className="text-center text-[#8C7B6B] text-sm mt-6">
                  Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total} products
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="w-72 bg-[#FAF8F5] h-full overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#2C1F14] text-[0.65rem] tracking-[0.2em] uppercase font-medium">Filters</span>
              <button onClick={() => setSidebarOpen(false)} className="text-[#8C7B6B] text-2xl leading-none">×</button>
            </div>
            
            <FilterGroup title="Lace Type">
              <div className="space-y-2.5">
                {LACE_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={activeLace.includes(type)} onChange={() => toggleFilter("lace", type)} className="accent-[#2C1F14] w-4 h-4" />
                    <span className="text-sm text-[#8C7B6B]">{type}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>
            
            <FilterGroup title="Color">
              <div className="space-y-2.5">
                {COLORS.map(color => (
                  <label key={color} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={activeColors.includes(color)} onChange={() => toggleFilter("color", color)} className="accent-[#2C1F14] w-4 h-4" />
                    <span className="text-sm text-[#8C7B6B]">{color}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>
            
            <FilterGroup title="Length">
              <div className="flex flex-wrap gap-2">
                {LENGTHS.map(len => (
                  <button key={len} onClick={() => toggleFilter("length", len)}
                    className={`w-12 py-1.5 text-xs border transition-all ${activeLengths.includes(len) ? "border-[#2C1F14] bg-[#2C1F14] text-[#FAF8F5]" : "border-[#E8E0D4] text-[#8C7B6B] hover:border-[#2C1F14]"}`}>
                    {len}"
                  </button>
                ))}
              </div>
            </FilterGroup>
            
            <button onClick={() => { clearFilters(); setSidebarOpen(false); }}
              className="w-full mt-6 border border-[#E8E0D4] text-[#8C7B6B] py-3 text-[0.65rem] tracking-[0.15em] uppercase hover:border-[#B8965A] hover:text-[#B8965A] transition-colors">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 bg-[#2C1F14] text-[#FAF8F5] px-6 py-3.5 text-sm flex items-center gap-3 z-50 shadow-lg transition-all duration-300 ${
        toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}>
        <span className="text-[#B8965A] text-lg">✓</span>
        {toast}
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}