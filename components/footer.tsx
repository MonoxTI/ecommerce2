// components/footer.tsx

import Link from "next/link";

const LINKS = {
  Shop: [
    ["All Wigs",    "/shop"],
    ["Lace Front",  "/shop?laceType=Lace+Front"],
    ["Full Lace",   "/shop?laceType=Full+Lace"],
    ["HD Lace",     "/shop?laceType=HD+Lace"],
  ],
  Support: [
    ["FAQ",         "/faq"],
    ["Shipping",    "/shipping"],
    ["Returns",     "/returns"],
    ["Contact",     "/contact"],
  ],
  Account: [
    ["My Orders",   "/account/orders"],
    ["Profile",     "/account/profile"],
    ["Track Order", "/track"],
    ["Admin",       "/admin"],
  ],
};

export default function Footer() {
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
    <footer className={`${colors.bg} border-t ${colors.border} pt-16 pb-8`}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">

        {/* ── Subtle Divider ─────────────────────────────── */}
        <div className={`h-px bg-gradient-to-r ${colors.divider} mb-12`} />

        {/* ── Main Grid ──────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* ── Brand Column ─────────────────────────────── */}
          <div className="col-span-2 md:col-span-1">
            <Link 
              href="/" 
              className="font-playfair text-3xl font-semibold tracking-[0.15em]  text-black hover:opacity-70 transition-opacity block"
            >
              novaa
            </Link>
            <p className={`${colors.textMuted} text-base leading-relaxed mt-4 max-w-[220px] font-cormorant font-light`}>
              Premium human hair wigs crafted for the woman who commands every room she enters.
            </p>

            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {[
                { label: "IG", href: "https://instagram.com/novaa.co.za" },
                { label: "FB", href: "https://facebook.com/Novaa" },
              ].map(({ label, href }) => (
                <a 
                  key={label} 
                  href={href} 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label={label}
                  className={`w-10 h-10 border ${colors.border} ${colors.borderHover} flex items-center justify-center ${colors.textMuted} ${colors.hover} text-xs tracking-[0.15em] uppercase transition-colors duration-200 font-cormorant`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Link Columns ─────────────────────────────── */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <p className={`${colors.text} text-xs tracking-[0.25em] uppercase font-cormorant font-medium mb-5`}>
                {title}
              </p>
              <ul className="space-y-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link 
                      href={href}
                      className={`${colors.textMuted} ${colors.hover} text-base transition-colors duration-200 font-cormorant font-light`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-black/10">
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
    </footer>
  );
}