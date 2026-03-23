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
  // Light theme color palette (consistent with Navbar)
  const colors = {
    bg: "bg-white",
    text: "text-[#1A1A1A]",
    textMuted: "text-[#666666]",
    textLight: "text-[#888888]",
    accent: "text-[#C9A84C]",
    accentHover: "hover:text-[#B8963C]",
    border: "border-[#E5E5E5]",
    borderAccent: "border-[#C9A84C]/20",
    divider: "from-transparent via-[#C9A84C]/30 to-transparent",
  };

  return (
    <footer className={`${colors.bg} border-t ${colors.border} pt-16 pb-8`}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">

        {/* Gold divider top */}
        <div className={`h-px bg-gradient-to-r ${colors.divider} mb-12`} />

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-2xl tracking-[0.2em] text-[#1A1A1A] hover:text-[#C9A84C] transition-colors block">
              Nova<span className={colors.accent}>a</span>
            </Link>
            <p className={`${colors.textMuted} text-sm leading-relaxed mt-4 max-w-[220px]`}>
              Premium human hair wigs crafted for the woman who commands every room she enters.
            </p>

            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {[
                { label: "Insta", href: "https://instagram.com/novaa.co.za" },
                { label: "FB", href: "https://facebook.com/Novaa" },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer"
                  className={`w-9 h-9 border ${colors.border} hover:border-[#C9A84C] flex items-center justify-center ${colors.textMuted} hover:text-[#C9A84C] text-xs tracking-wider transition-colors duration-200`}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <p className={`${colors.accent} text-xs tracking-[0.18em] uppercase font-medium mb-5`}>{title}</p>
              <ul className="space-y-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href}
                      className={`${colors.textMuted} hover:text-[#1A1A1A] text-sm transition-colors duration-200`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-[#E5E5E5]">
          <p className={`${colors.textLight} text-xs`}>
            © {new Date().getFullYear()} Novaa. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className={`${colors.textLight} hover:text-[#1A1A1A] text-xs transition-colors`}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={`${colors.textLight} hover:text-[#1A1A1A] text-xs transition-colors`}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}