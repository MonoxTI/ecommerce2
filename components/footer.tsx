// components/footer.tsx
import Link from "next/link";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/novaa.co.za",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/Novaa",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@novaa",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-black/10 pt-20 pb-10 font-cormorant">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">

        {/* Subtle top divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-14" />

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-16">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="block group">
              <img
                src="/6.png"
                alt="novaa"
                className="h-16 w-auto object-contain transition-opacity duration-300 group-hover:opacity-70"
              />
            </Link>
            <p className="text-[#666666] text-sm leading-relaxed mt-4 max-w-[200px]">
              Premium human hair wigs crafted for the woman who commands every room.
            </p>
            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {SOCIALS.map(({ label, href, icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-[#333] hover:border-black hover:text-black hover:-translate-y-0.5 transition-all duration-200">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-black text-[11px] tracking-[0.25em] uppercase font-semibold mb-5">Shop</p>
            <ul className="space-y-3.5">
              {[
                ["All Wigs",   "/shop"],
                ["Lace Front", "/shop?category=lace-front-wigs"],
                ["HD Lace",    "/shop?category=hd-lace-wigs"],
                ["Full Lace",  "/shop?category=full-lace-wigs"],
                ["Glueless",   "/shop?category=glueless-wigs"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href}
                    className="text-[#555] hover:text-black text-sm transition-colors duration-200 relative group font-light">
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-black transition-all duration-200 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-black text-[11px] tracking-[0.25em] uppercase font-semibold mb-5">Help</p>
            <ul className="space-y-3.5">
              {[
                ["Shipping Policy", "/shipping"],
                ["Returns Policy",  "/returns"],
                ["Contact Us",      "/contact"],
                ["FAQ",             "/faq"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href}
                    className="text-[#555] hover:text-black text-sm transition-colors duration-200 relative group font-light">
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-black transition-all duration-200 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-black text-[11px] tracking-[0.25em] uppercase font-semibold mb-5">Account</p>
            <ul className="space-y-3.5">
              {[
                ["My Orders",  "/account/orders"],
                ["Profile",    "/account/profile"],
                ["Sign In",    "/auth/login"],
                ["Register",   "/auth/register"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href}
                    className="text-[#555] hover:text-black text-sm transition-colors duration-200 relative group font-light">
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-black transition-all duration-200 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-black text-[11px] tracking-[0.25em] uppercase font-semibold mb-5">Legal</p>
            <ul className="space-y-3.5">
              {[
                ["Privacy Policy",   "/privacy"],
                ["Terms of Service", "/terms"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href}
                    className="text-[#555] hover:text-black text-sm transition-colors duration-200 relative group font-light">
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-black transition-all duration-200 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-black/8 mb-10">
          {[
            ["🚚", "Free Shipping",    "Orders over R1,000"],
            ["✦",  "100% Human Hair",  "Virgin hair guaranteed"],
            ["↩",  "Easy Returns",     "14-day policy"],
            ["🔒", "Secure Checkout",  "Paystack protected"],
          ].map(([icon, title, sub]) => (
            <div key={title as string} className="flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-black text-xs font-medium">{title}</p>
                <p className="text-[#666] text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#666] text-xs">
            © {new Date().getFullYear()} novaa. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex gap-5">
              {[
                ["Privacy",  "/privacy"],
                ["Terms",    "/terms"],
                ["Shipping", "/shipping"],
                ["Returns",  "/returns"],
              ].map(([label, href]) => (
                <Link key={label} href={href}
                  className="text-[#666] hover:text-black text-xs transition-colors">
                  {label}
                </Link>
              ))}
            </div>
            {/* Payment badges */}
            <div className="flex items-center gap-2 ml-4">
              {["Visa", "MC", "EFT"].map(card => (
                <span key={card}
                  className="text-[10px] px-2 py-1 border border-black/10 rounded text-[#666]">
                  {card}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}