// app/shop/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { productsApi, Product } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import ReviewForm from "@/components/ReviewForm";

// ─── HELPERS ─────────────────────────────────────────────────
function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  return (
    <span className={size === "lg" ? "text-black text-base" : "text-black text-xs"}>
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

  // Review form visibility
  const [showReviewForm, setShowReviewForm] = useState(false);

  // ── Fetch product ──────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi.get(slug).then(({ data, error }) => {
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setProduct(data);
      const firstVariant = data.variants.find(v => v.stock > 0) ?? data.variants[0];
      if (firstVariant) {
        setSelectedColor(firstVariant.color ?? "");
        setSelectedLength(firstVariant.length ?? "");
      }
      setLoading(false);
    });
  }, [slug]);

  // ── COLOR PALETTE (Cream / Black / White) ─────────────────
  const colors = {
    bg: "bg-[#F1F1F1]",
    bgCard: "bg-white",
    bgAlt: "bg-[#F1F1F1]",
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
    buttonAdded: "bg-[#2A6B3C]",
    divider: "from-transparent via-black/20 to-transparent",
    lowStock: "text-[#B85C3C]",
    inStock: "text-[#2A6B3C]",
  };

  if (loading) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center pt-20`}>
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !product) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center pt-20 text-center px-4`}>
      <div>
        <p className="font-playfair text-3xl text-[#666666] font-medium mb-4">Product not found</p>
        <Link href="/shop" className={`${colors.buttonBg} ${colors.buttonHover} text-white px-6 py-3 text-xs tracking-widest uppercase transition-colors font-cormorant`}>
          Back to Shop
        </Link>
      </div>
    </div>
  );

  // ── Derived state ──────────────────────────────────────────
  const colorsList  = [...new Set(product.variants.map(v => v.color).filter(Boolean))] as string[];
  const lengthsList = [...new Set(product.variants.map(v => v.length).filter(Boolean))]
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

  // ── Review handling ───────────────────────────────────────
  function handleReviewSuccess(newReview: any) {
    setProduct(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        reviews: [newReview, ...(prev.reviews || [])],
        reviewCount: (prev.reviewCount || 0) + 1,
      };
    });
    setShowReviewForm(false);
  }

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} pt-28 font-cormorant`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#666666] pb-8 font-cormorant">
          <Link href="/" className={`${colors.hover} transition-colors`}>Home</Link>
          <span>›</span>
          <Link href="/shop" className={`${colors.hover} transition-colors`}>Shop</Link>
          <span>›</span>
          <Link href={`/shop?category=${product.category.slug}`} className={`${colors.hover} transition-colors`}>
            {product.category.name}
          </Link>
          <span>›</span>
          <span className={`${colors.textMuted} truncate max-w-[200px]`}>{product.name}</span>
        </nav>

        {/* Main layout */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">

          {/* ── Gallery ──────────────────────────────────── */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#F1F1F1]">
              {product.images[activeImage] ? (
                <img
                  src={product.images[activeImage].url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#666666] text-xs tracking-widest uppercase font-cormorant">
                  No Image
                </div>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/70 border ${colors.border} text-white ${colors.borderHover} transition-colors`}
                    aria-label="Previous image"
                  >‹</button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % product.images.length)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/70 border ${colors.border} text-white ${colors.borderHover} transition-colors`}
                    aria-label="Next image"
                  >›</button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square overflow-hidden transition-all ${
                      i === activeImage ? "ring-2 ring-black" : "ring-2 ring-transparent hover:ring-black/20"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[0.7rem] tracking-[0.15em] uppercase text-black font-cormorant font-medium">
                {product.category.name}
              </span>
              {avgRating && (
                <div className="flex items-center gap-2 text-sm text-[#666666] font-cormorant">
                  <Stars rating={avgRating} />
                  <span>{avgRating.toFixed(1)} ({product.reviewCount})</span>
                </div>
              )}
            </div>

            <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-semibold text-black leading-tight">
              {product.name}
            </h1>

            <p className="font-playfair text-3xl text-black font-semibold">
              {formatPrice(selectedVariant?.price ?? product.minPrice)}
            </p>

            <div className={`h-px bg-gradient-to-r ${colors.divider}`} />

            {colorsList.length > 0 && (
              <div>
                <p className="text-[0.72rem] tracking-[0.12em] uppercase text-[#666666] mb-3 font-cormorant">
                  Color: <span className="text-black font-medium">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((color) => (
                    <button 
                      key={color} 
                      onClick={() => { setSelectedColor(color); setQuantity(1); }}
                      className={`px-4 py-2 text-xs tracking-wider uppercase border transition-all font-cormorant ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-black/10 text-[#666666] hover:border-black hover:text-black"
                      }`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lengthsList.length > 0 && (
              <div>
                <p className="text-[0.72rem] tracking-[0.12em] uppercase text-[#666666] mb-3 font-cormorant">
                  Length: <span className="text-black font-medium">{selectedLength}"</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {lengthsList.map((length) => {
                    const variant = product.variants.find(v => v.color === selectedColor && v.length === length);
                    const unavailable = !variant || variant.stock === 0;
                    return (
                      <button 
                        key={length}
                        onClick={() => !unavailable && (setSelectedLength(length), setQuantity(1))}
                        disabled={unavailable}
                        className={`px-4 py-2 text-xs tracking-wider uppercase border transition-all min-w-[3.5rem] text-center font-cormorant ${
                          selectedLength === length && !unavailable
                            ? "border-black bg-black text-white"
                            : unavailable
                              ? "border-black/10 text-[#666666] opacity-40 cursor-not-allowed line-through"
                              : "border-black/10 text-[#666666] hover:border-black hover:text-black"
                        }`}>
                        {length}"
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {inStock
              ? <p className={`text-sm font-medium font-cormorant ${lowStock ? colors.lowStock : colors.inStock}`}>
                  {lowStock ? `⚠ Only ${selectedVariant?.stock} left` : "✓ In Stock"}
                </p>
              : <p className="text-sm text-[#666666] font-cormorant">✗ Out of Stock</p>
            }

            {cartState === "error" && cartError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm font-cormorant">
                {cartError}
              </div>
            )}

            <div className="flex gap-4 items-stretch">
              <div className={`flex border ${colors.border} font-cormorant`}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-12 h-12 flex items-center justify-center text-[#666666] ${colors.hover} transition-colors text-lg border-r ${colors.border}`}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 flex items-center justify-center text-black text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock ?? 1, quantity + 1))}
                  className={`w-12 h-12 flex items-center justify-center text-[#666666] ${colors.hover} transition-colors text-lg border-l ${colors.border}`}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={!inStock || cartState === "loading"}
                className={`flex-1 h-12 px-6 flex items-center justify-center gap-2 text-xs tracking-[0.12em] uppercase font-medium transition-all font-cormorant ${
                  cartState === "added"
                    ? `${colors.buttonAdded} text-white`
                    : cartState === "loading"
                      ? "bg-black/60 text-white cursor-not-allowed"
                      : inStock
                        ? `${colors.buttonBg} text-white ${colors.buttonHover}`
                        : "bg-black/10 text-[#666666] cursor-not-allowed"
                }`}>
                {cartState === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding…
                  </span>
                ) : cartState === "added" ? (
                  <>✓ Added to Cart</>
                ) : inStock ? (
                  <>
                    Add to Cart
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                    </svg>
                  </>
                ) : "Out of Stock"}
              </button>
            </div>

            {inStock && (
              <Link 
                href="/checkout"
                className={`block w-full py-3 text-center text-xs tracking-[0.12em] uppercase border border-black text-black ${colors.buttonHover} bg-white transition-colors font-cormorant`}
              >
                Buy Now
              </Link>
            )}

            {selectedVariant && (
              <div className={`grid grid-cols-3 gap-4 p-4 ${colors.bgAlt} border ${colors.border} font-cormorant`}>
                {[
                  ["Density",   selectedVariant.density  ?? "—"],
                  ["Lace Type", selectedVariant.laceType ?? "—"],
                  ["Cap Size",  selectedVariant.capSize  ?? "—"],
                ].map(([label, val]) => (
                  <div key={label} className="text-center">
                    <div className="text-[0.68rem] tracking-[0.1em] uppercase text-[#666666] mb-1">{label}</div>
                    <div className="text-black font-medium text-sm">{val}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 pt-2">
              {[
                ["🚚", "Free shipping on orders over R1,000"],
                ["↩",  "14-day hassle-free returns"],
                ["✦",  "100% virgin human hair guaranteed"],
                ["🔒", "Secure checkout via PayFast"],
              ].map(([icon, text]) => (
                <div key={text as string} className="flex items-center gap-3 text-sm text-[#666666] font-cormorant">
                  <span className="text-lg">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ─────────────────────────────────────────── */}
        <div className={`border-t ${colors.border} pt-12 pb-16`}>
          <div className={`flex border-b ${colors.border} mb-8`}>
            {(["description", "details", "reviews"] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs tracking-[0.12em] uppercase transition-all border-b-2 -mb-px font-cormorant ${
                  activeTab === tab
                    ? "text-black border-black font-medium"
                    : "text-[#666666] border-transparent hover:text-black"
                }`}>
                {tab}
                {tab === "reviews" && <span className="ml-1">({product.reviewCount})</span>}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="max-w-3xl space-y-4">
              {product.description.split("\n").filter(Boolean).map((para, i) => (
                <p key={i} className="text-[0.95rem] text-[#666666] leading-relaxed font-cormorant font-light">{para.trim()}</p>
              ))}
            </div>
          )}

          {activeTab === "details" && selectedVariant && (
            <div className={`max-w-2xl divide-y ${colors.border} font-cormorant`}>
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
                  <span className="text-[#666666]">{label}</span>
                  <span className="text-black font-medium">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl">
              {/* Review Form Toggle */}
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className={`mb-6 ${colors.buttonBg} ${colors.buttonHover} text-white px-6 py-3 text-xs tracking-widest uppercase font-medium transition-colors font-cormorant`}
                >
                  Write a Review
                </button>
              ) : (
                <div className="mb-6">
                  <ReviewForm slug={slug} onSuccess={handleReviewSuccess} />
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="mt-3 text-xs text-[#666666] hover:text-black underline font-cormorant"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {product.reviews && product.reviews.length > 0 ? (
                <>
                  {avgRating && (
                    <div className={`flex gap-8 items-center p-6 ${colors.bgAlt} border ${colors.border} mb-8`}>
                      <div className="text-center">
                        <div className="font-playfair text-5xl text-black font-semibold leading-none">{avgRating.toFixed(1)}</div>
                        <Stars rating={avgRating} size="lg" />
                        <div className="text-xs text-[#666666] mt-1 font-cormorant">{product.reviewCount} reviews</div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = product.reviews?.filter((r: any) => r.rating === star).length ?? 0;
                          const totalReviews = product.reviews?.length ?? 1;
                          const pct   = (count / totalReviews) * 100;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-xs text-[#666666] w-3 text-right font-cormorant">{star}</span>
                              <span className="text-black text-xs">★</span>
                              <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                                <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-[#666666] w-5 font-cormorant">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="space-y-6">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className={`pb-6 border-b ${colors.border} last:border-0`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-black font-playfair">{review.user?.name}</span>
                              {review.verified && (
                                <span className="text-[0.65rem] bg-black/10 text-black px-2 py-0.5 tracking-wide font-cormorant">
                                  Verified
                                </span>
                              )}
                            </div>
                            <Stars rating={review.rating} />
                          </div>
                          <time className="text-xs text-[#666666] font-cormorant">
                            {new Date(review.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                          </time>
                        </div>
                        <p className="text-[0.88rem] text-[#666666] leading-relaxed font-cormorant font-light">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[#666666] text-sm font-cormorant">No reviews yet. Be the first to review this product.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}