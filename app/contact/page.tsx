// app/contact/page.tsx

import Link from "next/link";

const SOCIALS = [
  { label: "IG", href: "https://instagram.com/novaa.co.za", name: "Instagram" },
  { label: "FB", href: "https://facebook.com/Novaa", name: "Facebook" },
];

const CONTACT_INFO = [
  {
    title: "Email Us",
    value: "info@novaa.co.za",
    href: "mailto:info@novaa.co.za",
    
  },
  {
    title: "Call / WhatsApp",
    value: "+27 61 499 0918",
    href: "https://wa.me/276164990918",
    description: "Mon–Fri, 9am–5pm ",
  },
  {
    title: "Location",
    value: "Johannesburg North, South Africa",
    href: "#",
    description: "Online store – nationwide shipping",
  },
];

export default function ContactPage() {
  // ── COLOR PALETTE (Cream / Black / White) ───────────────
  const colors = {
    bg: "bg-white",
    bgCream: "bg-[#F1F1F1]",
    text: "text-black",
    textMuted: "text-[#333333]",
    textLight: "text-[#666666]",
    border: "border-black/10",
    borderHover: "hover:border-black",
    hover: "hover:text-black",
    divider: "from-transparent via-black/20 to-transparent",
  };

  return (
    <main className={`${colors.bg} min-h-screen`}>
      {/* ── Header / Hero ───────────────────────────────── */}
      <section className="pt-20 pb-12 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto">
          <Link 
            href="/" 
            className="font-playfair text-3xl font-semibold tracking-[0.15em] text-black hover:opacity-70 transition-opacity inline-block mb-8"
          >
            novaa
          </Link>
          <h1 className="font-playfair text-4xl md:text-5xl font-light text-black tracking-wide">
            Get in Touch
          </h1>
          <p className={`${colors.textMuted} text-lg mt-4 max-w-2xl font-cormorant font-light`}>
            Have a question about your order, need styling advice, or just want to say hello? 
            We&apos;re here to help you look and feel extraordinary.
          </p>
        </div>
      </section>

      {/* ── Subtle Divider ─────────────────────────────── */}
      <div className={`h-px bg-gradient-to-r ${colors.divider} mx-6 md:mx-12 mb-16`} />

      {/* ── Contact Details Grid ───────────────────────── */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {CONTACT_INFO.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`block p-8 border ${colors.border} ${colors.borderHover} transition-all duration-300 hover:shadow-lg`}
              >
                <p className={`${colors.text} text-xs tracking-[0.25em] uppercase font-cormorant font-medium mb-3`}>
                  {item.title}
                </p>
                <p className={`${colors.textMuted} text-xl font-cormorant font-light mb-2`}>
                  {item.value}
                </p>
                <p className={`${colors.textLight} text-sm font-cormorant`}>
                  {item.description}
                </p>
              </a>
            ))}
          </div>

          {/* ── Social Links ───────────────────────────── */}
          <div className="mt-20">
            <p className={`${colors.text} text-xs tracking-[0.25em] uppercase font-cormorant font-medium mb-6 text-center`}>
              Follow Us
            </p>
            <div className="flex justify-center gap-4">
              {SOCIALS.map(({ label, href, name }) => (
                <a 
                  key={label} 
                  href={href} 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label={name}
                  className={`w-14 h-14 border ${colors.border} ${colors.borderHover} flex items-center justify-center ${colors.textMuted} ${colors.hover} text-sm tracking-[0.15em] uppercase transition-all duration-200 font-cormorant hover:scale-105`}
                >
                  {label}
                </a>
              ))}
            </div>
            <p className={`${colors.textLight} text-center text-sm font-cormorant mt-6`}>
              Tag <span className="font-medium text-black">@novaa.co.za</span> to be featured
            </p>
          </div>

          {/* ── Optional: Quick Contact Form CTA ───────── */}
          <div className={`mt-20 p-8 md:p-12 ${colors.bgCream} text-center`}>
            <h2 className="font-playfair text-2xl md:text-3xl font-light text-black mb-4">
              Prefer to write?
            </h2>
            <p className={`${colors.textMuted} text-base font-cormorant font-light mb-8 max-w-xl mx-auto`}>
              Send us a message and our team will get back to you as soon as possible.
            </p>
            <Link
              href="mailto:hello@novaa.co.za"
              className={`inline-block px-8 py-4 bg-black text-white text-xs tracking-[0.2em] uppercase font-cormorant font-medium hover:bg-[#333] transition-colors duration-200`}
            >
              Email Us Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom Bar (matches footer) ───────────────── */}
      <div className={`border-t ${colors.border} py-6 px-6 md:px-12`}>
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`${colors.textLight} text-xs font-cormorant`}>
            © {new Date().getFullYear()} Novaa. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link 
              href="/privacy" 
              className={`${colors.textLight} ${colors.hover} text-xs transition-colors font-cormorant`}
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className={`${colors.textLight} ${colors.hover} text-xs transition-colors font-cormorant`}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}