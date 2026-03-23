"use client";
// app/page.tsx
import Link from "next/link";

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

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

// Light theme color palette (consistent with Navbar & Footer)
const colors = {
  bg: "bg-white",
  bgAlt: "bg-[#FAFAFA]",
  bgCard: "bg-white",
  text: "text-[#1A1A1A]",
  textMuted: "text-[#666666]",
  textLight: "text-[#888888]",
  accent: "text-[#C9A84C]",
  accentBg: "bg-[#C9A84C]",
  accentBgHover: "hover:bg-[#B8963C]",
  accentBorder: "border-[#C9A84C]",
  border: "border-[#E5E5E5]",
  borderLight: "border-[#F0F0F0]",
  gradient: "from-[#C9A84C]/30 to-transparent",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-px ${colors.accentBg}`} />
      <span className={`${colors.accent} text-xs tracking-[0.2em] uppercase font-medium`}>{children}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={`${colors.bg} min-h-screen`}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{
          background: `linear-gradient(105deg, rgba(255,255,255,0.95) 35%, rgba(255,255,255,0.7) 100%),
            url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80') center/cover no-repeat`,
        }} />
        <div className={`absolute left-6 md:left-12 top-1/4 bottom-1/4 w-px bg-gradient-to-b ${colors.gradient} z-10`} />

        <div className="relative z-20 max-w-screen-xl mx-auto px-6 md:px-12 pt-28 pb-16 w-full">
          <div className="max-w-2xl">
            <SectionLabel>Premium Human Hair</SectionLabel>
            <h1 className="font-serif text-6xl md:text-8xl font-light leading-none italic text-[#1A1A1A] mb-4">
              Nova<span className={colors.accent}>a</span>
            </h1>
            <h3 className="font-serif text-2xl md:text-4xl font-light leading-snug text-[#666666] mb-1">elevated beauty, with purpose</h3>
            <p className={`${colors.textMuted} text-base leading-relaxed max-w-md mb-10`}>
              Handcrafted wigs using 100% virgin human hair. Lace so natural, no one will know. From boardroom to ballroom — you set the standard.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/shop" className={`inline-flex items-center gap-2 ${colors.accentBg} ${colors.accentBgHover} text-white px-8 py-3 text-xs font-medium tracking-[0.12em] uppercase transition-colors shadow-sm`}>
                Shop Collection
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/shop?laceType=HD+Lace" className={`inline-flex items-center border ${colors.accentBorder} ${colors.accent} hover:bg-[#C9A84C] hover:text-white px-8 py-3 text-xs font-medium tracking-[0.12em] uppercase transition-colors`}>
                HD Lace
              </Link>
            </div>
            <div className="flex gap-10 mt-14 pt-8 border-t border-[#E5E5E5] flex-wrap">
              {[["2,400+", "Happy Customers"], ["100%", "Human Hair"], ["Free", "Shipping R1000+"]].map(([val, label]) => (
                <div key={label}>
                  <div className={`font-serif text-3xl ${colors.accent} leading-none`}>{val}</div>
                  <div className={`${colors.textLight} text-xs tracking-[0.1em] uppercase mt-1`}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-[#888888] text-[0.65rem] tracking-[0.15em] uppercase">
          Scroll
          <div className={`w-px h-10 bg-gradient-to-b ${colors.gradient}`} />
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ──────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <SectionLabel>Our Collection</SectionLabel>
              <h2 className={`font-serif text-4xl md:text-5xl ${colors.text} font-light`}>Featured Wigs</h2>
            </div>
            <Link href="/shop" className={`flex items-center gap-2 ${colors.textMuted} ${colors.accentHover} text-xs tracking-[0.08em] uppercase transition-colors border-b border-transparent hover:border-[#C9A84C] pb-0.5`}>
              View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.slug}`} className="group bg-white hover:-translate-y-1 transition-transform duration-300 border border-[#F0F0F0] hover:shadow-lg rounded-sm overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden bg-[#FAFAFA] relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {(product as any).badge && (
                    <span className={`absolute top-3 left-3 ${colors.accentBg} text-white text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2 py-1 shadow-sm`}>{(product as any).badge}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className={`${colors.accent} text-xs tracking-[0.12em] uppercase font-medium`}>View Details →</span>
                  </div>
                </div>
                <div className={`p-4 border-t ${colors.borderLight}`}>
                  <p className={`${colors.textLight} text-xs tracking-wider uppercase mb-1`}>{product.category} · {product.length}</p>
                  <h3 className={`font-serif ${colors.text} text-lg font-light leading-tight mb-1`}>{product.name}</h3>
                  <p className={`font-serif ${colors.accent} text-xl`}>{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ────────────────────────────────────── */}
      <section className={`py-24 ${colors.bgAlt}`}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={`w-8 h-px ${colors.accentBg}`} /><span className={`${colors.accent} text-xs tracking-[0.2em] uppercase font-medium`}>Shop By Type</span><div className={`w-8 h-px ${colors.accentBg}`} />
            </div>
            <h2 className={`font-serif text-4xl md:text-5xl ${colors.text} font-light`}>Find Your Perfect Match</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {collections.map((col) => (
              <Link key={col.title} href={col.href} className="group relative block overflow-hidden aspect-[3/4] border border-[#E5E5E5] rounded-sm">
                <img src={col.image} alt={col.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-[#1A1A1A]/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <span className={`block ${colors.accent} text-[0.65rem] tracking-[0.18em] uppercase mb-2`}>{col.subtitle}</span>
                  <h3 className="font-serif text-white text-3xl font-light mb-4">{col.title}</h3>
                  <span className="text-white/90 group-hover:text-[#C9A84C] text-xs tracking-[0.08em] uppercase transition-colors">Shop Now →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}