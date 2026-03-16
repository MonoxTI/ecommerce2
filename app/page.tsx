"use client";
// app/page.tsx
import Link from "next/link";
import Navbar from "@/components/navbar";
//import Footer from "@/components/layout/Footer";

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
  { name: "Thandi K.", location: "Cape Town",    quote: "I've tried many wig brands but AuraWig is on another level. The hair feels incredibly soft and the lace is flawless.", rating: 5, product: "Body Wave Lace Front" },
  { name: "Amara O.",  location: "Durban",       quote: "Fast shipping, beautiful packaging, and the wig is absolutely stunning. This is luxury at its finest.", rating: 5, product: "Straight Full Lace" },
];

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[#C9A84C] text-xs tracking-wider">
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-px bg-[#C9A84C]" />
      <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-medium">{children}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{
          background: `linear-gradient(105deg, rgba(10,10,10,0.93) 40%, rgba(10,10,10,0.55) 100%),
            url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&q=80') center/cover no-repeat`,
        }} />
        <div className="absolute left-6 md:left-12 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[#C9A84C] to-transparent z-10" />

        <div className="relative z-20 max-w-screen-xl mx-auto px-6 md:px-12 pt-28 pb-16 w-full">
          <div className="max-w-2xl">
            <SectionLabel>Premium Human Hair</SectionLabel>
            <h1 className="font-serif text-6xl md:text-8xl font-light leading-none text-[#F5F0E8] mb-1">Wear Your</h1>
            <h1 className="font-serif text-6xl md:text-8xl font-light leading-none italic text-[#C9A84C] mb-8">Crown.</h1>
            <p className="text-[#C8BFB0] text-base leading-relaxed max-w-md mb-10">
              Handcrafted wigs using 100% virgin human hair. Lace so natural, no one will know. From boardroom to ballroom — you set the standard.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/shop" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-8 py-3 text-xs font-medium tracking-[0.12em] uppercase transition-colors">
                Shop Collection
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/shop?laceType=HD+Lace" className="inline-flex items-center border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] px-8 py-3 text-xs font-medium tracking-[0.12em] uppercase transition-colors">
                HD Lace
              </Link>
            </div>
            <div className="flex gap-10 mt-14 pt-8 border-t border-white/[0.06] flex-wrap">
              {[["2,400+", "Happy Customers"], ["100%", "Human Hair"], ["Free", "Shipping R1000+"]].map(([val, label]) => (
                <div key={label}>
                  <div className="font-serif text-3xl text-[#C9A84C] leading-none">{val}</div>
                  <div className="text-[#6B6B6B] text-xs tracking-[0.1em] uppercase mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-[#6B6B6B] text-[0.65rem] tracking-[0.15em] uppercase">
          Scroll
          <div className="w-px h-10 bg-gradient-to-b from-[#C9A84C] to-transparent" />
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-[#111111] py-6">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[["🚚","Free Shipping","Orders over R1,000"],["✦","100% Human Hair","Virgin hair only"],["↩","Easy Returns","14-day policy"],["🔒","Secure Payment","PayFast protected"]].map(([icon,title,sub]) => (
              <div key={title as string} className="py-2">
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-[#F5F0E8] text-xs font-medium tracking-wider uppercase mb-0.5">{title}</div>
                <div className="text-[#6B6B6B] text-xs">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ──────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <SectionLabel>Our Collection</SectionLabel>
              <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] font-light">Featured Wigs</h2>
            </div>
            <Link href="/shop" className="flex items-center gap-2 text-[#C8BFB0] hover:text-[#C9A84C] text-xs tracking-[0.08em] uppercase transition-colors border-b border-transparent hover:border-[#C9A84C] pb-0.5">
              View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.slug}`} className="group bg-[#111111] hover:-translate-y-1 transition-transform duration-300">
                <div className="aspect-[3/4] overflow-hidden bg-[#1A1A1A] relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {(product as any).badge && (
                    <span className="absolute top-3 left-3 bg-[#C9A84C] text-[#0A0A0A] text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2 py-1">{(product as any).badge}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-[#C9A84C] text-xs tracking-[0.12em] uppercase font-medium">View Details →</span>
                  </div>
                </div>
                <div className="p-4 border-t border-white/[0.06]">
                  <p className="text-[#6B6B6B] text-xs tracking-wider uppercase mb-1">{product.category} · {product.length}</p>
                  <h3 className="font-serif text-[#F5F0E8] text-lg font-light leading-tight mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1.5 mb-2"><Stars rating={product.rating} /><span className="text-[#6B6B6B] text-xs">({product.reviews})</span></div>
                  <p className="font-serif text-[#C9A84C] text-xl">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ────────────────────────────────────── */}
      <section className="py-24 bg-[#111111]">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#C9A84C]" /><span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-medium">Shop By Type</span><div className="w-8 h-px bg-[#C9A84C]" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] font-light">Find Your Perfect Match</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {collections.map((col) => (
              <Link key={col.title} href={col.href} className="group relative block overflow-hidden aspect-[3/4]">
                <img src={col.image} alt={col.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <span className="block text-[#C9A84C] text-[0.65rem] tracking-[0.18em] uppercase mb-2">{col.subtitle}</span>
                  <h3 className="font-serif text-[#F5F0E8] text-3xl font-light mb-4">{col.title}</h3>
                  <span className="text-[#C8BFB0] group-hover:text-[#C9A84C] text-xs tracking-[0.08em] uppercase transition-colors">Shop Now →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ───────────────────────────────────── */}
      <section className="relative py-24 text-center overflow-hidden" style={{
        background: `linear-gradient(rgba(10,10,10,0.75), rgba(10,10,10,0.75)), url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80') center/cover no-repeat`,
      }}>
        <div className="absolute inset-8 border border-[#C9A84C]/30 pointer-events-none" />
        <div className="relative max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C9A84C]" /><span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-medium">Limited Time</span><div className="w-8 h-px bg-[#C9A84C]" />
          </div>
          <h2 className="font-serif text-5xl md:text-7xl font-light text-[#F5F0E8] leading-tight">Free Shipping on Orders</h2>
          <h2 className="font-serif text-5xl md:text-7xl font-light italic text-[#C9A84C] mb-8">Over R1,000</h2>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-10 py-3.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors">
            Shop Now
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#C9A84C]" /><span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-medium">Customer Love</span><div className="w-8 h-px bg-[#C9A84C]" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] font-light">What Our Queens Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#111111] border border-white/[0.06] p-9">
                <div className="font-serif text-6xl text-[#C9A84C] opacity-50 leading-none mb-2">"</div>
                <p className="text-[#C8BFB0] text-sm leading-relaxed italic mb-6">{t.quote}</p>
                <div className="border-t border-white/[0.06] pt-5">
                  <Stars rating={t.rating} />
                  <div className="mt-2">
                    <span className="text-[#F5F0E8] text-sm font-medium">{t.name}</span>
                    <span className="text-[#6B6B6B] text-xs ml-2">— {t.location}</span>
                  </div>
                  <div className="text-[#C9A84C] text-xs mt-1">{t.product}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ─────────────────────────────────────── */}
      <section className="py-20 bg-[#111111] border-t border-white/[0.06]">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#C9A84C]" /><span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-medium">Stay In The Know</span><div className="w-8 h-px bg-[#C9A84C]" />
          </div>
          <h2 className="font-serif text-4xl text-[#F5F0E8] font-light mb-4">Join the Inner Circle</h2>
          <p className="text-[#6B6B6B] text-sm leading-relaxed mb-8">Get early access to new arrivals, exclusive offers, and styling tips.</p>
          <form className="flex" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email address"
              className="flex-1 bg-[#1A1A1A] border border-white/[0.06] border-r-0 text-[#F5F0E8] px-5 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B]"
            />
            <button type="submit" className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-6 text-xs font-medium tracking-[0.12em] uppercase transition-colors flex-shrink-0">
              Subscribe
            </button>
          </form>
          <p className="text-[#6B6B6B] text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      
    </div>
  );
}