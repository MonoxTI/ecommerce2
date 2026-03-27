// app/shop/page.tsx
"use client";

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
      className="group bg-white hover:-translate-y-1 transition-transform duration-300 cursor-pointer border border-black/5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/shop/${product.slug}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F1F1F1]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[#E5E5E5] flex items-center justify-center text-[#666666] text-[0.65rem] tracking-widest uppercase font-cormorant">
            No Image
          </div>
        )}
 
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.inStock && (
            <span className="bg-black text-white text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1 font-cormorant">
              Sold Out
            </span>
          )}
          {badge && (
            <span className={`text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1 font-medium font-cormorant ${
              badge === "New" || badge === "New Arrival"
                ? "bg-black text-white"
                : badge === "Limited"
                  ? "bg-transparent border border-black text-black"
                  : "bg-black text-white"
            }`}>
              {badge}
            </span>
          )}
        </div>
 
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}>
          <span className="text-white text-[0.65rem] tracking-[0.12em] uppercase font-cormorant font-medium mb-3">
            View Details →
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!product.inStock}
            className="w-full bg-white hover:bg-[#F1F1F1] text-black py-2.5 text-[0.65rem] tracking-[0.15em] uppercase font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-cormorant"
          >
            {product.inStock ? "Add to Bag" : "Out of Stock"}
          </button>
        </div>
      </div>
 
      {/* Product Info */}
      <div className="p-4 border-t border-black/10">
        <p className="text-[#666666] text-[0.65rem] tracking-wider uppercase mb-1 font-cormorant">
          {product.category.name}
          {product.variants[0]?.length && ` · ${product.variants[0].length}"`}
        </p>
        <h3 className="font-playfair text-black text-lg font-medium leading-tight mb-2 group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-playfair text-black text-xl font-semibold">
            {product.minPrice !== product.maxPrice
              ? `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}`
              : formatPrice(product.minPrice)
            }
          </span>
          {product.avgRating && (
            <span className="text-black text-xs flex items-center gap-0.5">
              {"★".repeat(Math.floor(product.avgRating))}
              <span className="text-[#666666] ml-1 tracking-wider font-cormorant">({product.reviewCount})</span>
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
    <div className="border-b border-black/10 pb-5 mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full mb-3"
      >
        <span className="text-black text-[0.68rem] tracking-[0.18em] uppercase font-cormorant font-medium">{title}</span>
        <span className="text-black text-lg leading-none font-playfair">{open ? "−" : "+"}</span>
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
    if (!token) { window.location.href = "/auth/login"; return; }
    const error = await addItem(firstVariant.id, 1, token);
    const msg = error ? error : `${product.name} added to bag`;
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  }

  const activeCount = activeLace.length + activeColors.length + activeLengths.length + (activeCategory ? 1 : 0);

  // ── COLOR PALETTE (Cream / Black / White) ─────────────────
  const colors = {
    bg: "bg-[#F1F1F1]",
    bgCard: "bg-white",
    text: "text-black",
    textMuted: "text-[#333333]",
    textLight: "text-[#666666]",
    border: "border-black/10",
    borderHover: "hover:border-black",
    hover: "hover:text-black",
    badgeBg: "bg-black",
    badgeText: "text-white",
    buttonBg: "bg-black",
    buttonHover: "hover:bg-[#333333]",
    divider: "from-transparent via-black/20 to-transparent",
  };

  return (
    <div className={`${colors.bg} min-h-screen font-cormorant`}>

      {/* ── PAGE HEADER ────────────────────────────────────── */}
      <div className="pt-28 pb-10 px-6 md:px-12 border-b border-black/10">
        <div className="max-w-screen-xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[#666666] text-xs tracking-widest uppercase mb-4 font-cormorant">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>›</span>
            <span className="text-black">Shop</span>
          </div>

          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-px bg-black" />
                <span className="text-black text-[0.65rem] tracking-[0.3em] uppercase font-cormorant font-medium">Curated Collection</span>
              </div>
              <h1 className="font-playfair text-5xl md:text-6xl font-semibold text-black leading-none">
                All Wigs
              </h1>
            </div>
            <p className="text-[#666666] text-sm font-cormorant">{total} styles</p>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ──────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="border-b border-black/10 bg-[#F1F1F1] sticky top-[72px] z-30">
          <div className="max-w-screen-xl mx-auto px-6 md:px-12">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => { setActiveCategory(""); setPage(1); }}
                className={`px-5 py-4 text-[0.68rem] tracking-[0.18em] uppercase border-b-2 transition-all whitespace-nowrap flex-shrink-0 font-cormorant ${
                  !activeCategory
                    ? "border-black text-black font-medium" 
                    : "border-transparent text-[#666666] hover:text-black"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button key={cat.id}
                  onClick={() => { setActiveCategory(cat.slug); setPage(1); }}
                  className={`px-5 py-4 text-[0.68rem] tracking-[0.18em] uppercase border-b-2 transition-all whitespace-nowrap flex-shrink-0 font-cormorant ${
                    activeCategory === cat.slug
                      ? "border-black text-black font-medium"
                      : "border-transparent text-[#666666] hover:text-black"
                  }`}
                >
                  {cat.name}
                  {cat._count?.products ? <span className="ml-1.5 text-[#666666] font-cormorant">({cat._count.products})</span> : null}
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search wigs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadProducts()}
              className="w-full pl-9 pr-4 py-2.5 border border-black/10 bg-white text-black text-sm outline-none focus:border-black transition-colors placeholder:text-[#666666] font-cormorant"
            />
          </div>

          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={clearFilters}
                className="text-black text-xs tracking-widest uppercase hover:opacity-70 transition-opacity font-cormorant">
                Clear ({activeCount}) ×
              </button>
            )}
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="border border-black/10 bg-white text-black text-xs tracking-widest uppercase px-4 py-2.5 outline-none focus:border-black transition-colors cursor-pointer font-cormorant">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="font-cormorant">{o.label}</option>)}
            </select>
            {/* Mobile filter btn */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden border border-black/10 bg-white text-black text-xs tracking-widest uppercase px-4 py-2.5 flex items-center gap-2 font-cormorant"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
                      className="accent-black w-3.5 h-3.5"
                    />
                    <span className={`text-sm transition-colors font-cormorant ${activeLace.includes(type) ? "text-black font-medium" : "text-[#666666] group-hover:text-black"}`}>
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
                      className="accent-black w-3.5 h-3.5"
                    />
                    <span className={`text-sm transition-colors font-cormorant ${activeColors.includes(color) ? "text-black font-medium" : "text-[#666666] group-hover:text-black"}`}>
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
                    className={`w-12 py-1.5 text-xs border transition-all font-cormorant ${
                      activeLengths.includes(len)
                        ? "border-black bg-black text-white"
                        : "border-black/10 text-[#666666] hover:border-black hover:text-black"
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
                  <div key={i} className="bg-white border border-black/5">
                    <div className="aspect-[3/4] bg-[#F1F1F1] animate-pulse" />
                    <div className="p-4">
                      <div className="h-3 bg-[#F1F1F1] animate-pulse w-1/2 mb-2" />
                      <div className="h-4 bg-[#F1F1F1] animate-pulse w-3/4 mb-2" />
                      <div className="h-5 bg-[#F1F1F1] animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              // ── EMPTY STATE ───────────────────────────────
              <div className="text-center py-24">
                <p className="font-playfair text-3xl text-[#666666] font-medium mb-4">No products found</p>
                <p className="text-[#666666] text-sm mb-6 font-cormorant">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-black hover:bg-[#333333] text-white px-6 py-3 text-[0.7rem] tracking-[0.15em] uppercase font-medium transition-colors font-cormorant">
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
                  <div className="flex justify-center items-center gap-2 mt-14 pt-10 border-t border-black/10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-black/10 text-[#666666] text-[0.65rem] tracking-[0.15em] uppercase hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all font-cormorant"
                    >
                      ← Prev
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          return (
                            <div key={p} className="flex items-center">
                              {prev && p - prev > 1 && (
                                <span className="px-2 text-[#666666] font-cormorant">…</span>
                              )}
                              <button 
                                onClick={() => setPage(p)}
                                className={`w-10 h-10 text-[0.7rem] border transition-all font-cormorant ${
                                  p === page
                                    ? "border-black bg-black text-white"
                                    : "border-black/10 text-[#666666] hover:border-black hover:text-black"
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
                      className="px-4 py-2 border border-black/10 text-[#666666] text-[0.65rem] tracking-[0.15em] uppercase hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all font-cormorant"
                    >
                      Next →
                    </button>
                  </div>
                )}
                
                {/* Results Count */}
                <p className="text-center text-[#666666] text-sm mt-6 font-cormorant">
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
          <div className="w-72 bg-white h-full overflow-y-auto p-6 shadow-xl border-l border-black/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-black text-[0.65rem] tracking-[0.2em] uppercase font-cormorant font-medium">Filters</span>
              <button onClick={() => setSidebarOpen(false)} className="text-[#666666] text-2xl leading-none font-playfair hover:text-black transition-colors">×</button>
            </div>
            
            <FilterGroup title="Lace Type">
              <div className="space-y-2.5">
                {LACE_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={activeLace.includes(type)} onChange={() => toggleFilter("lace", type)} className="accent-black w-4 h-4" />
                    <span className="text-sm text-[#666666] font-cormorant">{type}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>
            
            <FilterGroup title="Color">
              <div className="space-y-2.5">
                {COLORS.map(color => (
                  <label key={color} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={activeColors.includes(color)} onChange={() => toggleFilter("color", color)} className="accent-black w-4 h-4" />
                    <span className="text-sm text-[#666666] font-cormorant">{color}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>
            
            <FilterGroup title="Length">
              <div className="flex flex-wrap gap-2">
                {LENGTHS.map(len => (
                  <button key={len} onClick={() => toggleFilter("length", len)}
                    className={`w-12 py-1.5 text-xs border transition-all font-cormorant ${activeLengths.includes(len) ? "border-black bg-black text-white" : "border-black/10 text-[#666666] hover:border-black"}`}>
                    {len}"
                  </button>
                ))}
              </div>
            </FilterGroup>
            
            <button onClick={() => { clearFilters(); setSidebarOpen(false); }}
              className="w-full mt-6 border border-black/10 text-[#666666] py-3 text-[0.65rem] tracking-[0.15em] uppercase hover:border-black hover:text-black transition-colors font-cormorant">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 bg-black text-white px-6 py-3.5 text-sm flex items-center gap-3 z-50 shadow-lg transition-all duration-300 ${
        toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}>
        <span className="text-white text-lg font-playfair">✓</span>
        <span className="font-cormorant">{toast}</span>
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