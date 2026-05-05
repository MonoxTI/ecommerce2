"use client";
// app/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { productsApi, Product } from "@/lib/api";

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

const colors = {
  bg: "bg-[#F1F1F1]", bgAlt: "bg-white", textMuted: "text-[#333333]",
  textLight: "text-[#666666]", borderLight: "border-black/5",
  divider: "from-transparent via-black/20 to-transparent",
};

const collections = [
  { title: "Lace Front", subtitle: "Natural hairline, effortless style", href: "/shop?category=lace-front-wigs",  image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80" },
  { title: "HD Lace",    subtitle: "Undetectable. Unmatched.",           href: "/shop?category=hd-lace-wigs",    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80" },
  { title: "Full Lace",  subtitle: "Versatile styling, all day wear",    href: "/shop?category=full-lace-wigs",  image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "text-black" : "text-black/20"}`}
          viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Product card skeleton ──────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-white border border-black/5 rounded-sm overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-black/5" />
      <div className="p-5 space-y-2">
        <div className="h-3 bg-black/5 w-1/2 rounded" />
        <div className="h-4 bg-black/5 w-3/4 rounded" />
        <div className="h-6 bg-black/5 w-1/3 rounded" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    productsApi.list({ limit: "4", sortBy: "newest" }).then(({ data }) => {
      if (data?.items) setProducts(data.items.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className={`${colors.bg} min-h-screen`}>

      {/* ── HERO WITH BIG LOGO ─────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0" style={{
          background: `linear-gradient(180deg, rgba(241,241,241,0.95) 0%, rgba(241,241,241,0.9) 100%),
            url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80') center/cover no-repeat`,
        }} />
        
        {/* Decorative elements */}
        <div className="absolute left-8 md:left-16 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-black/20 to-transparent z-10" />
        <div className="absolute right-8 md:right-16 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-black/20 to-transparent z-10" />

        {/* Main Content */}
        <div className="relative z-20 max-w-screen-xl mx-auto px-6 md:px-12 pt-12 pb-16 w-full">
          <div className="flex flex-col items-center text-center">
            
            {/* BIG LOGO - Main Focus */}
            <div className="mb-8 md:mb-12">
              <img 
                src="/3.png" 
                alt="novaa" 
                className="h-90 md:h-100 lg:h-135 w-auto object-contain"
                style={{ mixBlendMode: "multiply" }} 
              />
            </div>

            {/* Tagline */}
            <p className={`${colors.textMuted} text-lg md:text-2xl lg:text-3xl leading-relaxed max-w-3xl mb-4 font-light tracking-wide`}>
              Premium Human Hair Wigs
            </p>
            <p className={`${colors.textLight} text-sm md:text-base leading-relaxed max-w-2xl mb-12 font-light`}>
              Handcrafted using 100% virgin human hair. Lace so natural, no one will know.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-6 flex-wrap justify-center mb-16">
              <Link href="/shop"
                className="inline-flex items-center gap-3 bg-black text-white px-12 py-5 text-xs tracking-[0.25em] uppercase font-medium hover:opacity-80 transition-opacity">
                Shop Collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/shop?category=hd-lace-wigs"
                className="inline-flex items-center border border-black/30 text-black px-12 py-5 text-xs tracking-[0.25em] uppercase font-medium hover:bg-black hover:text-white transition-all">
                HD Lace
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-16 md:gap-24 pt-10 border-t border-black/10 flex-wrap justify-center">
              {[["2,400+", "Happy Customers"], ["100%", "Human Hair"], ["R3000+", "Free Shipping"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="font-serif text-3xl md:text-5xl text-black font-semibold leading-none">{val}</div>
                  <div className={`${colors.textLight} text-xs tracking-[0.2em] uppercase mt-3`}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-px h-16 bg-gradient-to-b from-black/40 to-transparent" />
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-16 flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs tracking-[0.3em] uppercase text-black/60 font-medium">Our Collection</span>
                <div className="h-px flex-1 bg-black/10" />
              </div>
              <h2 className="font-serif text-5xl md:text-6xl text-black font-light">Featured Wigs</h2>
            </div>
            <Link href="/shop"
              className={`flex items-center gap-2 ${colors.textMuted} text-xs tracking-[0.15em] uppercase border-b border-transparent hover:border-black pb-1 transition-colors`}>
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.length === 0
                ? (
                  <div className="col-span-4 text-center py-16 text-black/40 text-sm">
                    No products yet — add some in the{" "}
                    <Link href="/admin/products" className="underline hover:text-black">admin panel</Link>.
                  </div>
                )
                : products.map((product) => (
                  <Link key={product.id} href={`/shop/${product.slug}`}
                    className="group bg-white hover:-translate-y-1.5 transition-all duration-500 border border-black/5 rounded-sm overflow-hidden">
                    <div className="aspect-[3/4] overflow-hidden bg-[#F1F1F1] relative">
                      {product.images[0] ? (
                        <img src={product.images[0].url} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/20 text-xs tracking-widest uppercase">
                          No Image
                        </div>
                      )}
                      {!product.inStock && (
                        <span className="absolute top-4 left-4 bg-black/60 text-white text-[0.6rem] tracking-[0.15em] uppercase px-3 py-1.5">
                          Sold Out
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-black text-[0.65rem] tracking-[0.2em] uppercase font-medium">View Details</span>
                      </div>
                    </div>
                    <div className={`p-5 border-t ${colors.borderLight}`}>
                      <p className={`${colors.textLight} text-[0.65rem] tracking-[0.12em] uppercase mb-2`}>
                        {product.category.name}
                        {product.variants[0]?.length && ` · ${product.variants[0].length}"`}
                      </p>
                      <h3 className="font-serif text-black text-lg font-light leading-tight mb-2 group-hover:opacity-70 transition-opacity">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline justify-between">
                        <p className="font-serif text-black text-2xl">
                          {product.minPrice !== product.maxPrice
                            ? `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}`
                            : formatPrice(product.minPrice)}
                        </p>
                        {product.avgRating && (
                          <div className="flex items-center gap-1">
                            <StarRating rating={product.avgRating} />
                            <span className={`${colors.textLight} text-xs`}>({product.reviewCount})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ──────────────────────────────────── */}
      <section className={`py-28 ${colors.bgAlt}`}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-xs tracking-[0.3em] uppercase text-black/60 font-medium">Shop By Type</span>
              <div className="h-px w-24 bg-black/10" />
            </div>
            <h2 className="font-serif text-5xl md:text-6xl text-black font-light">Find Your Perfect Match</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((col) => (
              <Link key={col.title} href={col.href}
                className="group relative block overflow-hidden aspect-[3/4] border border-black/10 rounded-sm">
                <img src={col.image} alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="block text-white/80 text-[0.65rem] tracking-[0.25em] uppercase mb-3">{col.subtitle}</span>
                  <h3 className="font-serif text-white text-4xl font-light mb-5">{col.title}</h3>
                  <span className="text-white/90 text-xs tracking-[0.15em] uppercase inline-flex items-center gap-2">
                    Shop Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className={`h-px bg-gradient-to-r ${colors.divider}`} />
    </div>
  );
}