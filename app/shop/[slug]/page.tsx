"use client";
// app/shop/[slug]/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { productsApi, Product } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

// ─── HELPERS ─────────────────────────────────────────────────

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  return (
    <span className={size === "lg" ? "text-[#B8965A] text-base" : "text-[#B8965A] text-xs"}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────

export default function ProductPage() {
  const params              = useParams();
  const router              = useRouter();
  const slug                = params.slug as string;
  const { getValidToken }   = useAuthStore();
  const { addItem }         = useCartStore();

  const [product, setProduct]       = useState<Product | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);

  const [selectedColor, setSelectedColor]   = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [quantity, setQuantity]             = useState(1);
  const [activeImage, setActiveImage]       = useState(0);
  const [activeTab, setActiveTab]           = useState<"description" | "details" | "reviews">("description");

  // Add to cart state
  const [cartState, setCartState]   = useState<"idle" | "loading" | "added" | "error">("idle");
  const [cartError, setCartError]   = useState("");

  // ── Fetch product ──────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi.get(slug).then(({ data, error }) => {
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setProduct(data);
      // Set defaults from first available variant
      const firstVariant = data.variants.find(v => v.stock > 0) ?? data.variants[0];
      if (firstVariant) {
        setSelectedColor(firstVariant.color ?? "");
        setSelectedLength(firstVariant.length ?? "");
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center pt-20">
      <div className="w-6 h-6 border-2 border-[#B8965A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center pt-20 text-center px-4">
      <div>
        <p className="font-serif text-3xl text-[#C4B5A5] font-light mb-4">Product not found</p>
        <Link href="/shop" className="bg-[#B8965A] text-[#2C1F14] px-6 py-3 text-xs tracking-widest uppercase">
          Back to Shop
        </Link>
      </div>
    </div>
  );

  // ── Derived state ──────────────────────────────────────────

  const colors  = [...new Set(product.variants.map(v => v.color).filter(Boolean))] as string[];
  const lengths = [...new Set(product.variants.map(v => v.length).filter(Boolean))]
    .sort((a, b) => Number(a) - Number(b)) as string[];

  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.length === selectedLength
  ) ?? product.variants.find(v => v.stock > 0) ?? product.variants[0];

  const inStock  = (selectedVariant?.stock ?? 0) > 0;
  const lowStock = inStock && (selectedVariant?.stock ?? 0) <= 5;

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : null;

  // ── Add to cart ────────────────────────────────────────────

  async function handleAddToCart() {
    if (!selectedVariant || !inStock) return;
    setCartState("loading");
    setCartError("");

    const token = await getValidToken();
    if (!token) {
      router.push(`/auth/login?redirect=/shop/${slug}`);
      return;
    }

    const error = await addItem(selectedVariant.id, quantity, token);
    if (error) {
      setCartState("error");
      setCartError(error);
      setTimeout(() => setCartState("idle"), 3000);
    } else {
      setCartState("added");
      setTimeout(() => setCartState("idle"), 2500);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C1F14] pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#C4B5A5] pb-8">
          <Link href="/" className="hover:text-[#B8965A] transition-colors">Home</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-[#B8965A] transition-colors">Shop</Link>
          <span>›</span>
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#B8965A] transition-colors">
            {product.category.name}
          </Link>
          <span>›</span>
          <span className="text-[#8C7B6B] truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main layout */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">

          {/* ── Gallery ──────────────────────────────────── */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F2ED]">
              {product.images[activeImage] ? (
                <img
                  src={product.images[activeImage].url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#C4B5A5] text-xs tracking-widest uppercase">
                  No Image
                </div>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#2C1F14]/70 border border-[#E8E0D4] text-[#FAF8F5] hover:border-[#B8965A] transition-colors"
                  >‹</button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#2C1F14]/70 border border-[#E8E0D4] text-[#FAF8F5] hover:border-[#B8965A] transition-colors"
                  >›</button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`aspect-square overflow-hidden transition-all ${
                      i === activeImage ? "ring-2 ring-[#B8965A]" : "ring-2 ring-transparent hover:ring-[#E8E0D4]"
                    }`}>
                    <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────────── */}
          <div className="space-y-6">
            {/* Category + rating */}
            <div className="flex justify-between items-center">
              <span className="text-[0.7rem] tracking-[0.15em] uppercase text-[#B8965A] font-medium">
                {product.category.name}
              </span>
              {avgRating && (
                <div className="flex items-center gap-2 text-sm text-[#8C7B6B]">
                  <Stars rating={avgRating} />
                  <span>{avgRating.toFixed(1)} ({product.reviewCount})</span>
                </div>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#2C1F14] leading-tight">
              {product.name}
            </h1>

            <p className="font-serif text-3xl text-[#B8965A]">
              {formatPrice(selectedVariant?.price ?? product.minPrice)}
            </p>

            <div className="h-px bg-gradient-to-r from-transparent via-[#B8965A]/30 to-transparent" />

            {/* Color selector */}
            {colors.length > 0 && (
              <div>
                <p className="text-[0.72rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-3">
                  Color: <span className="text-[#2C1F14] font-medium">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button key={color} onClick={() => { setSelectedColor(color); setQuantity(1); }}
                      className={`px-4 py-2 text-xs tracking-wider uppercase border transition-all ${
                        selectedColor === color
                          ? "border-[#2C1F14] bg-[#2C1F14] text-[#FAF8F5]"
                          : "border-[#E8E0D4] text-[#8C7B6B] hover:border-[#2C1F14] hover:text-[#2C1F14]"
                      }`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Length selector */}
            {lengths.length > 0 && (
              <div>
                <p className="text-[0.72rem] tracking-[0.12em] uppercase text-[#8C7B6B] mb-3">
                  Length: <span className="text-[#2C1F14] font-medium">{selectedLength}"</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {lengths.map((length) => {
                    const variant = product.variants.find(v => v.color === selectedColor && v.length === length);
                    const unavailable = !variant || variant.stock === 0;
                    return (
                      <button key={length}
                        onClick={() => !unavailable && (setSelectedLength(length), setQuantity(1))}
                        disabled={unavailable}
                        className={`px-4 py-2 text-xs tracking-wider uppercase border transition-all min-w-[3.5rem] text-center ${
                          selectedLength === length && !unavailable
                            ? "border-[#2C1F14] bg-[#2C1F14] text-[#FAF8F5]"
                            : unavailable
                              ? "border-[#E8E0D4] text-[#C4B5A5] opacity-40 cursor-not-allowed line-through"
                              : "border-[#E8E0D4] text-[#8C7B6B] hover:border-[#2C1F14] hover:text-[#2C1F14]"
                        }`}>
                        {length}"
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock status */}
            {inStock
              ? <p className={`text-sm font-medium ${lowStock ? "text-[#E8A84C]" : "text-green-600"}`}>
                  {lowStock ? `⚠ Only ${selectedVariant?.stock} left` : "✓ In Stock"}
                </p>
              : <p className="text-sm text-[#8C7B6B]">✗ Out of Stock</p>
            }

            {/* Error message */}
            {cartState === "error" && cartError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
                {cartError}
              </div>
            )}

            {/* Qty + Add to Cart */}
            <div className="flex gap-4 items-stretch">
              <div className="flex border border-[#E8E0D4]">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-[#8C7B6B] hover:text-[#2C1F14] transition-colors text-lg border-r border-[#E8E0D4]">
                  −
                </button>
                <span className="w-12 flex items-center justify-center text-[#2C1F14] text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock ?? 1, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center text-[#8C7B6B] hover:text-[#2C1F14] transition-colors text-lg border-l border-[#E8E0D4]">
                  +
                </button>
              </div>

              <button onClick={handleAddToCart}
                disabled={!inStock || cartState === "loading"}
                className={`flex-1 h-12 px-6 flex items-center justify-center gap-2 text-xs tracking-[0.12em] uppercase font-medium transition-all ${
                  cartState === "added"
                    ? "bg-[#2A6B3C] text-white"
                    : cartState === "loading"
                      ? "bg-[#B8965A]/60 text-[#2C1F14] cursor-not-allowed"
                      : inStock
                        ? "bg-[#B8965A] text-[#2C1F14] hover:bg-[#D4AF6E]"
                        : "bg-[#E8E0D4] text-[#C4B5A5] cursor-not-allowed"
                }`}>
                {cartState === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#2C1F14] border-t-transparent rounded-full animate-spin" />
                    Adding…
                  </span>
                ) : cartState === "added" ? (
                  <>✓ Added to Cart</>
                ) : inStock ? (
                  <>
                    Add to Cart
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                    </svg>
                  </>
                ) : "Out of Stock"}
              </button>
            </div>

            {/* Buy Now */}
            {inStock && (
              <Link href="/checkout"
                className="block w-full py-3 text-center text-xs tracking-[0.12em] uppercase border border-[#2C1F14] text-[#2C1F14] hover:bg-[#2C1F14] hover:text-[#FAF8F5] transition-colors">
                Buy Now
              </Link>
            )}

            {/* Specs */}
            {selectedVariant && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-[#F5F2ED] border border-[#E8E0D4]">
                {[
                  ["Density",   selectedVariant.density  ?? "—"],
                  ["Lace Type", selectedVariant.laceType ?? "—"],
                  ["Cap Size",  selectedVariant.capSize  ?? "—"],
                ].map(([label, val]) => (
                  <div key={label} className="text-center">
                    <div className="text-[0.68rem] tracking-[0.1em] uppercase text-[#8C7B6B] mb-1">{label}</div>
                    <div className="text-[#2C1F14] font-medium text-sm">{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="space-y-3 pt-2">
              {[
                ["🚚", "Free shipping on orders over R1,000"],
                ["↩",  "14-day hassle-free returns"],
                ["✦",  "100% virgin human hair guaranteed"],
                ["🔒", "Secure checkout via PayFast"],
              ].map(([icon, text]) => (
                <div key={text as string} className="flex items-center gap-3 text-sm text-[#8C7B6B]">
                  <span className="text-lg">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ─────────────────────────────────────────── */}
        <div className="border-t border-[#E8E0D4] pt-12 pb-16">
          <div className="flex border-b border-[#E8E0D4] mb-8">
            {(["description", "details", "reviews"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs tracking-[0.12em] uppercase transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? "text-[#B8965A] border-[#B8965A] font-medium"
                    : "text-[#8C7B6B] border-transparent hover:text-[#2C1F14]"
                }`}>
                {tab}
                {tab === "reviews" && <span className="ml-1">({product.reviewCount})</span>}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="max-w-3xl space-y-4">
              {product.description.split("\n").filter(Boolean).map((para, i) => (
                <p key={i} className="text-[0.95rem] text-[#8C7B6B] leading-relaxed">{para.trim()}</p>
              ))}
            </div>
          )}

          {activeTab === "details" && selectedVariant && (
            <div className="max-w-2xl divide-y divide-[#E8E0D4]">
              {[
                ["Hair Type",       "100% Virgin Human Hair"],
                ["Lace Type",       selectedVariant.laceType ?? "—"],
                ["Density",         selectedVariant.density  ?? "—"],
                ["Length",          selectedVariant.length ? `${selectedVariant.length}"` : "—"],
                ["Cap Size",        selectedVariant.capSize  ?? "Medium"],
                ["Cap Type",        "Swiss Lace + Elastic Band"],
                ["Can Be Dyed",     "Yes"],
                ["Can Be Bleached", "Yes"],
                ["SKU",             selectedVariant.sku],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-3 text-sm">
                  <span className="text-[#8C7B6B]">{label}</span>
                  <span className="text-[#2C1F14] font-medium">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl">
              {product.reviews && product.reviews.length > 0 ? (
                <>
                  {avgRating && (
                    <div className="flex gap-8 items-center p-6 bg-[#F5F2ED] border border-[#E8E0D4] mb-8">
                      <div className="text-center">
                        <div className="font-serif text-5xl text-[#B8965A] leading-none">{avgRating.toFixed(1)}</div>
                        <Stars rating={avgRating} size="lg" />
                        <div className="text-xs text-[#8C7B6B] mt-1">{product.reviewCount} reviews</div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = product.reviews.filter((r: any) => r.rating === star).length;
                          const pct   = (count / product.reviews.length) * 100;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-xs text-[#8C7B6B] w-3 text-right">{star}</span>
                              <span className="text-[#B8965A] text-xs">★</span>
                              <div className="flex-1 h-1.5 bg-[#E8E0D4] rounded-full overflow-hidden">
                                <div className="h-full bg-[#B8965A] rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-[#8C7B6B] w-5">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="space-y-6">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="pb-6 border-b border-[#E8E0D4] last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[#2C1F14]">{review.user?.name}</span>
                              {review.verified && (
                                <span className="text-[0.65rem] bg-[#B8965A]/10 text-[#B8965A] px-2 py-0.5 tracking-wide">
                                  Verified
                                </span>
                              )}
                            </div>
                            <Stars rating={review.rating} />
                          </div>
                          <time className="text-xs text-[#8C7B6B]">
                            {new Date(review.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                          </time>
                        </div>
                        <p className="text-[0.88rem] text-[#8C7B6B] leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[#8C7B6B] text-sm">No reviews yet. Be the first to review this product.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}