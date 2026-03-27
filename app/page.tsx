// app/page.tsx
"use client";

import Link from "next/link";

// ── DATA ───────────────────────────────────────────────────
const featuredProducts = [
  { id: "1", slug: "body-wave-lace-front-18", name: "Body Wave Lace Front", price: 189900, category: "Lace Front", length: "18\"", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80", rating: 4.9, reviews: 124 },
  { id: "2", slug: "deep-wave-hd-lace-22", name: "Deep Wave HD Lace", price: 249900, category: "HD Lace", length: "22\"", image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80", rating: 4.8, reviews: 89, badge: "Best Seller" },
  { id: "3", slug: "straight-full-lace-20", name: "Straight Full Lace", price: 319900, category: "Full Lace", length: "20\"", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80", rating: 5.0, reviews: 56, badge: "New Arrival" },
  { id: "4", slug: "loose-curl-13x4-frontal", name: "Loose Curl 13×4 Frontal", price: 219900, category: "Lace Front", length: "20\"", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80", rating: 4.7, reviews: 203 },
];

const collections = [
  { title: "Lace Front", subtitle: "Natural hairline, effortless style", href: "/shop?laceType=Lace+Front", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80" },
  { title: "HD Lace",    subtitle: "Undetectable. Unmatched.",           href: "/shop?laceType=HD+Lace",    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80" },
  { title: "Full Lace",  subtitle: "Versatile styling, all day wear",    href: "/shop?laceType=Full+Lace",  image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80" },
];

const testimonials = [
  { name: "Naledi M.", location: "Johannesburg", quote: "The HD Lace wig looks so natural that my colleagues thought it was my real hair. The quality is exceptional.", rating: 5, product: "Deep Wave HD Lace" },
  { name: "Thandi K.", location: "Cape Town",    quote: "I've tried many wig brands but Novaa is on another level. The hair feels incredibly soft and the lace is flawless.", rating: 5, product: "Body Wave Lace Front" },
  { name: "Amara O.",  location: "Durban",       quote: "Fast shipping, beautiful packaging, and the wig is absolutely stunning. This is luxury at its finest.", rating: 5, product: "Straight Full Lace" },
];

// ── UTILITIES ──────────────────────────────────────────────
function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

// ── COLOR PALETTE ──────────────────────────────────────────
const colors = {
  bg: "bg-[#F1F1F1]",
  bgAlt: "bg-white",
  text: "text-black",
  textMuted: "text-[#333333]",
  textLight: "text-[#666666]",
  border: "border-black/10",
  borderLight: "border-black/5",
  hover: "hover:bg-black hover:text-white",
  badgeBg: "bg-black",
  badgeText: "text-white",
  divider: "from-transparent via-black/20 to-transparent",
};

// ── COMPONENTS ────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-cormorant text-xs tracking-[0.3em] uppercase text-black/70 font-medium">
        {children}
      </span>
      <div className="h-px flex-1 bg-black/10" />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg 
          key={i} 
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-black' : 'text-black/20'}`} 
          viewBox="0 0 24 24" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className={`${colors.bg} min-h-screen font-cormorant`}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, rgba(241,241,241,0.98) 40%, rgba(241,241,241,0.85) 100%),
              url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80') center/cover no-repeat`,
          }}
        />
        <div className="absolute left-8 md:left-16 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-black/20 to-transparent z-10" />

        <div className="relative z-20 max-w-screen-xl mx-auto px-6 md:px-12 pt-24 pb-16 w-full">
          <div className="max-w-3xl">
            <SectionLabel>Premium Human Hair</SectionLabel>
            
            <h1 className="font-playfair text-7xl md:text-9xl font-semibold leading-none text-black mb-3">
              novaa
            </h1>
            
            <h2 className="font-playfair text-xl md:text-3xl font-normal tracking-[0.05em] text-black/80 mb-6">
              elevated beauty, with purpose
            </h2>
            
            <p className={`${colors.textMuted} text-base md:text-lg leading-relaxed max-w-xl mb-12 font-light`}>
              Handcrafted wigs using 100% virgin human hair. Lace so natural, no one will know. 
              From boardroom to ballroom — you set the standard.
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Link 
                href="/shop" 
                className={`inline-flex items-center gap-3 bg-black text-white px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 ${colors.hover} shadow-sm`}
              >
                Shop Collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link 
                href="/shop?laceType=HD+Lace" 
                className="inline-flex items-center border border-black/30 text-black px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-black hover:text-white"
              >
                HD Lace
              </Link>
            </div>
            
            <div className="flex gap-12 mt-20 pt-10 border-t border-black/10 flex-wrap">
              {[["2,400+", "Happy Customers"], ["100%", "Human Hair"], ["Free", "Shipping R1000+"]].map(([val, label]) => (
                <div key={label}>
                  <div className="font-playfair text-4xl text-black font-semibold leading-none">{val}</div>
                  <div className={`${colors.textLight} text-xs tracking-[0.15em] uppercase mt-2`}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 text-black/50 text-[0.6rem] tracking-[0.25em] uppercase">
          <span>Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-black/30 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ──────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-16 flex-wrap gap-6">
            <div>
              <SectionLabel>Our Collection</SectionLabel>
              <h2 className="font-playfair text-5xl md:text-6xl text-black font-semibold">
                Featured Wigs
              </h2>
            </div>
            <Link 
              href="/shop" 
              className={`flex items-center gap-2 ${colors.textMuted} text-xs tracking-[0.15em] uppercase transition-colors border-b border-transparent hover:border-black pb-1`}
            >
              View All 
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {featuredProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/shop/${product.slug}`} 
                className="group bg-white hover:-translate-y-1.5 transition-all duration-500 border border-black/5 rounded-sm overflow-hidden"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#F1F1F1] relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    loading="lazy"
                  />
                  {(product as any).badge && (
                    <span className={`absolute top-4 left-4 ${colors.badgeBg} ${colors.badgeText} text-[0.6rem] font-medium tracking-[0.15em] uppercase px-3 py-1.5`}>
                      {(product as any).badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-black text-[0.65rem] tracking-[0.2em] uppercase font-medium">View Details</span>
                  </div>
                </div>
                <div className={`p-5 border-t ${colors.borderLight}`}>
                  <p className={`${colors.textLight} text-[0.65rem] tracking-[0.12em] uppercase mb-2`}>
                    {product.category} · {product.length}
                  </p>
                  <h3 className="font-playfair text-black text-lg font-medium leading-tight mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline justify-between">
                    <p className="font-playfair text-black text-2xl font-semibold">
                      {formatPrice(product.price)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={product.rating} />
                      <span className={`${colors.textLight} text-xs`}> ({product.reviews})</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ────────────────────────────────────── */}
      <section className={`py-28 ${colors.bgAlt}`}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <SectionLabel>Shop By Type</SectionLabel>
            <h2 className="font-playfair text-5xl md:text-6xl text-black font-semibold">
              Find Your Perfect Match
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((col) => (
              <Link 
                key={col.title} 
                href={col.href} 
                className="group relative block overflow-hidden aspect-[3/4] border border-black/10 rounded-sm"
              >
                <img 
                  src={col.image} 
                  alt={col.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className={`block font-cormorant text-white/90 text-[0.65rem] tracking-[0.25em] uppercase mb-3 font-medium`}>
                    {col.subtitle}
                  </span>
                  <h3 className="font-playfair text-white text-4xl font-semibold mb-5">
                    {col.title}
                  </h3>
                  <span className="text-white/95 group-hover:text-white text-xs tracking-[0.15em] uppercase transition-colors inline-flex items-center gap-2">
                    Shop Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

     
      {/* ── Subtle Bottom Divider ─────────────────────────── */}
      <div className={`h-px bg-gradient-to-r ${colors.divider}`} />
    </div>
  );
}