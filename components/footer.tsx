// components/footer.tsx

import Link from "next/link";

const LINKS = {
  Shop: [
    ["All Wigs",    "/shop"],
    ["Lace Front",  "/shop?category=lace-front-wigs"],
    ["HD Lace",     "/shop?category=hd-lace-wigs"],
    ["Full Lace",   "/shop?category=full-lace-wigs"],
  ],
  Support: [
    ["Shipping Policy", "/shipping"],
    ["Returns Policy",  "/returns"],
    ["Contact",         "/contact"],
    ["FAQ",             "/faq"],
  ],
  Legal: [
    ["Privacy Policy",   "/privacy"],
    ["Terms of Service", "/terms"],
  ],
  Account: [
    ["My Orders",  "/account/orders"],
    ["Profile",    "/account/profile"],
    ["Sign In",    "/auth/login"],
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-white/[0.06] pt-16 pb-8">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">

        {/* Gold divider top */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent mb-12" />

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <img src="/3.png" alt="novaa" className="h-8 w-auto object-contain"
                style={{ mixBlendMode: "multiply", filter: "invert(1) brightness(2)" }} />
            </Link>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mt-4 max-w-[220px]">
              Premium human hair wigs crafted for the woman who commands every room she enters.
            </p>

            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {[
                { label: "IG", href: "https://instagram.com" },
                { label: "TK", href: "https://tiktok.com" },
                { label: "FB", href: "https://facebook.com" },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer"
                  className="w-9 h-9 border border-white/[0.06] hover:border-[#C9A84C] flex items-center justify-center text-[#6B6B6B] hover:text-[#C9A84C] text-xs tracking-wider transition-colors duration-200">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-[#C9A84C] text-xs tracking-[0.18em] uppercase font-medium mb-5">{title}</p>
              <ul className="space-y-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-[#6B6B6B] hover:text-[#F5F0E8] text-sm transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-white/[0.06] mb-8">
          {[
            ["🚚", "Free Shipping", "Orders over R1,000"],
            ["✦",  "100% Human Hair", "Virgin hair guaranteed"],
            ["↩",  "Easy Returns",  "14-day policy"],
            ["🔒", "Secure Checkout", "Paystack protected"],
          ].map(([icon, title, sub]) => (
            <div key={title as string} className="flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-[#F5F0E8] text-xs font-medium">{title}</p>
                <p className="text-[#6B6B6B] text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6B6B6B] text-xs">
            © {new Date().getFullYear()} novaa. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            {[
              ["Privacy Policy",  "/privacy"],
              ["Terms of Service","/terms"],
              ["Shipping Policy", "/shipping"],
              ["Returns Policy",  "/returns"],
            ].map(([label, href]) => (
              <Link key={label} href={href}
                className="text-[#6B6B6B] hover:text-[#F5F0E8] text-xs transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}