"use client";

// app/shop/[slug]/page.tsx
// Product detail page

import { useState } from "react";
import Link from "next/link";

// ─── MOCK PRODUCT (replace with real API call) ────────────────

const MOCK_PRODUCT = {
  id:          "1",
  slug:        "deep-wave-hd-lace-22",
  name:        "Deep Wave HD Lace Wig",
  description: `Experience the pinnacle of luxury with our Deep Wave HD Lace Wig. 
    Crafted from 100% virgin human hair, this wig features an ultra-thin HD lace 
    that melts seamlessly into any skin tone — truly undetectable.
    
    The deep wave pattern adds volume and texture that flows naturally with every 
    movement. Pre-plucked hairline with baby hairs for a flawless natural look.`,
  brand:    "AuraWig",
  category: { name: "HD Lace", slug: "hd-lace" },
  images: [
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
  ],
  variants: [
    { id: "v1", sku: "DW-HD-NB-18", price: 229900, stock: 8,  color: "Natural Black", length: "18", density: "150%", laceType: "HD Lace", capSize: "Medium" },
    { id: "v2", sku: "DW-HD-NB-20", price: 249900, stock: 5,  color: "Natural Black", length: "20", density: "150%", laceType: "HD Lace", capSize: "Medium" },
    { id: "v3", sku: "DW-HD-NB-22", price: 279900, stock: 3,  color: "Natural Black", length: "22", density: "180%", laceType: "HD Lace", capSize: "Medium" },
    { id: "v4", sku: "DW-HD-NB-24", price: 319900, stock: 0,  color: "Natural Black", length: "24", density: "180%", laceType: "HD Lace", capSize: "Medium" },
    { id: "v5", sku: "DW-HD-DB-20", price: 249900, stock: 7,  color: "Dark Brown",    length: "20", density: "150%", laceType: "HD Lace", capSize: "Medium" },
    { id: "v6", sku: "DW-HD-DB-22", price: 279900, stock: 4,  color: "Dark Brown",    length: "22", density: "180%", laceType: "HD Lace", capSize: "Medium" },
  ],
  reviews: [
    { id: "r1", user: { name: "Naledi M." }, rating: 5, comment: "Absolutely stunning wig! The HD lace is truly undetectable — I've gotten so many compliments.", verified: true, createdAt: "2024-11-15" },
    { id: "r2", user: { name: "Thandi K." }, rating: 5, comment: "Best wig I've ever bought. The hair quality is exceptional and the waves hold so well.", verified: true, createdAt: "2024-11-02" },
    { id: "r3", user: { name: "Amara O." }, rating: 4, comment: "Beautiful hair, ships fast. The lace needs a bit of trimming but the quality is amazing.", verified: false, createdAt: "2024-10-28" },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  return (
    <span style={{ color: "var(--gold)", fontSize: size === "lg" ? "1rem" : "0.75rem" }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = MOCK_PRODUCT;

  // Derive unique option values
  const colors  = [...new Set(product.variants.map(v => v.color))];
  const lengths = [...new Set(product.variants.map(v => v.length))].sort((a, b) => Number(a) - Number(b));

  const [selectedColor,  setSelectedColor]  = useState(colors[0]);
  const [selectedLength, setSelectedLength] = useState(lengths[0]);
  const [quantity,       setQuantity]       = useState(1);
  const [activeImage,    setActiveImage]    = useState(0);
  const [addedToCart,    setAddedToCart]    = useState(false);
  const [activeTab,      setActiveTab]      = useState<"description" | "details" | "reviews">("description");

  // Find the matching variant
  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.length === selectedLength
  ) ?? product.variants[0];

  const inStock     = selectedVariant.stock > 0;
  const lowStock    = selectedVariant.stock > 0 && selectedVariant.stock <= 5;
  const avgRating   = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;

  function handleAddToCart() {
    // TODO: call POST /api/cart
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  return (
    <div style={{ paddingTop: "7rem" }}>
      {/* Breadcrumb */}
      <div className="container" style={{ paddingBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.75rem", color: "var(--muted)" }}>
          <Link href="/" style={{ transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
          >Home</Link>
          <span>›</span>
          <Link href="/shop" style={{ transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
          >Shop</Link>
          <span>›</span>
          <Link href={`/shop?category=${product.category.slug}`} style={{ transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
          >{product.category.name}</Link>
          <span>›</span>
          <span style={{ color: "var(--cream-dim)" }}>{product.name}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginBottom: "6rem" }}>

          {/* ── Left: Image Gallery ───────────────────────── */}
          <div>
            {/* Main image */}
            <div style={{
              aspectRatio: "4/5",
              overflow:   "hidden",
              background: "var(--obsidian-mid)",
              marginBottom: "1rem",
              position:   "relative",
            }}>
              <img
                src={product.images[activeImage]}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }}
              />

              {/* Arrows */}
              {product.images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)}
                    style={{
                      position:  "absolute",
                      left:      "1rem",
                      top:       "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(10,10,10,0.7)",
                      border:    "1px solid var(--border-subtle)",
                      color:     "var(--cream)",
                      width:     "40px",
                      height:    "40px",
                      display:   "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor:    "pointer",
                      transition: "border-color 0.2s",
                    }}
                  >‹</button>
                  <button onClick={() => setActiveImage((activeImage + 1) % product.images.length)}
                    style={{
                      position:  "absolute",
                      right:     "1rem",
                      top:       "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(10,10,10,0.7)",
                      border:    "1px solid var(--border-subtle)",
                      color:     "var(--cream)",
                      width:     "40px",
                      height:    "40px",
                      display:   "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor:    "pointer",
                      transition: "border-color 0.2s",
                    }}
                  >›</button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{
                    aspectRatio: "1",
                    overflow:    "hidden",
                    border:      i === activeImage ? "2px solid var(--gold)" : "2px solid transparent",
                    transition:  "border-color 0.2s",
                    padding:     0,
                    cursor:      "pointer",
                  }}
                >
                  <img src={img} alt={`View ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: Product Info ───────────────────────── */}
          <div>
            {/* Category + rating */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)" }}>
                {product.category.name}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
                <Stars rating={avgRating} />
                <span>{avgRating.toFixed(1)} ({product.reviews.length} reviews)</span>
              </div>
            </div>

            {/* Name */}
            <h1 style={{
              fontFamily:   "var(--font-display)",
              fontSize:     "clamp(1.8rem, 3vw, 2.75rem)",
              fontWeight:   400,
              color:        "var(--cream)",
              lineHeight:   1.15,
              marginBottom: "1.25rem",
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{
              fontFamily:   "var(--font-display)",
              fontSize:     "2rem",
              color:        "var(--gold)",
              marginBottom: "2rem",
            }}>
              {formatPrice(selectedVariant.price)}
            </div>

            <div className="divider-gold" />

            {/* Color selector */}
            <div style={{ marginBottom: "1.75rem" }}>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem" }}>
                Color: <span style={{ color: "var(--cream)" }}>{selectedColor}</span>
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`filter-chip ${selectedColor === color ? "active" : ""}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Length selector */}
            <div style={{ marginBottom: "1.75rem" }}>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem" }}>
                Length: <span style={{ color: "var(--cream)" }}>{selectedLength}"</span>
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {lengths.map((length) => {
                  const variant = product.variants.find(v => v.color === selectedColor && v.length === length);
                  const unavailable = !variant || variant.stock === 0;
                  return (
                    <button
                      key={length}
                      onClick={() => !unavailable && setSelectedLength(length)}
                      className={`filter-chip ${selectedLength === length ? "active" : ""}`}
                      style={{
                        opacity:        unavailable ? 0.35 : 1,
                        cursor:         unavailable ? "not-allowed" : "pointer",
                        textDecoration: unavailable ? "line-through" : "none",
                        minWidth:       "3.5rem",
                        textAlign:      "center",
                      }}
                    >
                      {length}"
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock status */}
            {inStock ? (
              <p style={{ fontSize: "0.78rem", color: lowStock ? "#E8A84C" : "#6BCB77", marginBottom: "1.5rem" }}>
                {lowStock ? `⚠ Only ${selectedVariant.stock} left in stock` : "✓ In Stock"}
              </p>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
                ✗ Out of Stock
              </p>
            )}

            {/* Quantity + Add to Cart */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", alignItems: "stretch" }}>
              {/* Qty stepper */}
              <div style={{
                display:     "flex",
                border:      "1px solid var(--border-subtle)",
                alignItems:  "center",
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width:   "42px",
                    height:  "50px",
                    color:   "var(--cream-dim)",
                    fontSize: "1.2rem",
                    cursor:  "pointer",
                    transition: "color 0.2s",
                    borderRight: "1px solid var(--border-subtle)",
                  }}
                >−</button>
                <span style={{ width: "42px", textAlign: "center", fontSize: "0.9rem", color: "var(--cream)" }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                  style={{
                    width:   "42px",
                    height:  "50px",
                    color:   "var(--cream-dim)",
                    fontSize: "1.2rem",
                    cursor:  "pointer",
                    transition: "color 0.2s",
                    borderLeft: "1px solid var(--border-subtle)",
                  }}
                >+</button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                style={{
                  flex:          1,
                  padding:       "0 1.5rem",
                  height:        "50px",
                  background:    addedToCart ? "#2A6B3C" : inStock ? "var(--gold)" : "var(--obsidian-light)",
                  color:         addedToCart ? "white" : inStock ? "var(--obsidian)" : "var(--muted)",
                  fontSize:      "0.78rem",
                  fontWeight:    500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor:        inStock ? "pointer" : "not-allowed",
                  transition:    "all 0.3s",
                  border:        "none",
                  display:       "flex",
                  alignItems:    "center",
                  justifyContent: "center",
                  gap:           "0.5rem",
                }}
              >
                {addedToCart ? (
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

            {/* Buy now */}
            {inStock && (
              <Link href="/checkout" className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                <span>Buy Now</span>
              </Link>
            )}

            {/* Variant specs */}
            <div style={{
              marginTop:  "2rem",
              padding:    "1.25rem",
              background: "var(--obsidian-soft)",
              border:     "1px solid var(--border-subtle)",
              display:    "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap:        "1rem",
              fontSize:   "0.78rem",
            }}>
              {[
                ["Density",   selectedVariant.density ?? "—"],
                ["Lace Type", selectedVariant.laceType ?? "—"],
                ["Cap Size",  selectedVariant.capSize  ?? "—"],
              ].map(([label, val]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--muted)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.3rem" }}>{label}</div>
                  <div style={{ color: "var(--cream)", fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Guarantees */}
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                ["🚚", "Free shipping on orders over R1,000"],
                ["↩", "14-day hassle-free returns"],
                ["✦", "100% virgin human hair guaranteed"],
                ["🔒", "Secure checkout via PayFast"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: "0.75rem", alignItems: "center", fontSize: "0.8rem", color: "var(--muted)" }}>
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Details / Reviews ─────── */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "3rem", marginBottom: "5rem" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: "0", borderBottom: "1px solid var(--border-subtle)", marginBottom: "2.5rem" }}>
            {(["description", "details", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding:       "1rem 2rem",
                  fontSize:      "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color:         activeTab === tab ? "var(--gold)" : "var(--muted)",
                  borderBottom:  activeTab === tab ? "2px solid var(--gold)" : "2px solid transparent",
                  transition:    "all 0.2s",
                  cursor:        "pointer",
                  marginBottom:  "-1px",
                  fontWeight:    activeTab === tab ? 500 : 400,
                }}
              >
                {tab}
                {tab === "reviews" && ` (${product.reviews.length})`}
              </button>
            ))}
          </div>

          {/* Description tab */}
          {activeTab === "description" && (
            <div style={{ maxWidth: "720px" }}>
              {product.description.split("\n").filter(Boolean).map((para, i) => (
                <p key={i} style={{ fontSize: "0.95rem", color: "var(--cream-dim)", lineHeight: 1.9, marginBottom: "1.25rem" }}>
                  {para.trim()}
                </p>
              ))}
            </div>
          )}

          {/* Details tab */}
          {activeTab === "details" && (
            <div style={{ maxWidth: "560px" }}>
              {[
                ["Hair Type",     "100% Virgin Human Hair"],
                ["Hair Texture",  "Deep Wave"],
                ["Lace Type",     selectedVariant.laceType ?? "—"],
                ["Density",       selectedVariant.density  ?? "—"],
                ["Length",        `${selectedVariant.length}" inches`],
                ["Cap Size",      selectedVariant.capSize  ?? "Medium"],
                ["Cap Type",      "Swiss Lace + Elastic Band"],
                ["Can Be Dyed",   "Yes"],
                ["Can Be Bleached", "Yes"],
                ["SKU",           selectedVariant.sku],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display:      "flex",
                  justifyContent: "space-between",
                  alignItems:   "center",
                  padding:      "0.9rem 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize:     "0.85rem",
                }}>
                  <span style={{ color: "var(--muted)", letterSpacing: "0.05em" }}>{label}</span>
                  <span style={{ color: "var(--cream)", fontWeight: 400 }}>{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === "reviews" && (
            <div style={{ maxWidth: "720px" }}>
              {/* Summary */}
              <div style={{
                display:     "flex",
                gap:         "3rem",
                alignItems:  "center",
                padding:     "2rem",
                background:  "var(--obsidian-soft)",
                border:      "1px solid var(--border-subtle)",
                marginBottom: "2rem",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "4rem", color: "var(--gold)", lineHeight: 1 }}>
                    {avgRating.toFixed(1)}
                  </div>
                  <Stars rating={avgRating} size="lg" />
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.4rem" }}>
                    {product.reviews.length} reviews
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = product.reviews.filter(r => r.rating === star).length;
                    const pct   = (count / product.reviews.length) * 100;
                    return (
                      <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--muted)", width: "12px", textAlign: "right" }}>{star}</span>
                        <span style={{ color: "var(--gold)", fontSize: "0.65rem" }}>★</span>
                        <div style={{ flex: 1, height: "4px", background: "var(--obsidian-light)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold)", borderRadius: "2px" }} />
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--muted)", width: "20px" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual reviews */}
              {product.reviews.map((review) => (
                <div key={review.id} style={{
                  padding:      "1.75rem 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--cream)" }}>
                          {review.user.name}
                        </span>
                        {review.verified && (
                          <span style={{
                            fontSize:   "0.65rem",
                            background: "rgba(201,168,76,0.1)",
                            color:      "var(--gold)",
                            padding:    "0.15rem 0.5rem",
                            letterSpacing: "0.06em",
                          }}>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {new Date(review.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--cream-dim)", lineHeight: 1.8 }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .container > div[style*="repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}