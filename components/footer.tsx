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
  return (
    <footer className="bg-[#0D0D0D] border-t border-white/[0.06] pt-16 pb-8">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">

        {/* Gold divider top */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent mb-12" />

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-2xl tracking-[0.2em] text-[#F5F0E8] hover:text-[#C9A84C] transition-colors">
              Novaa<span className="text-[#C9A84C]">elevated beauty, with purpose.</span>
            </Link>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mt-4 max-w-[220px]">
              Premium human hair wigs crafted for the woman who commands every room she enters.
            </p>

            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {[
                { label: "Insta", href: "https://instagram.com/novaa.co.za" },
                { label: "FB", href: "https://facebook.com/Novaa" },
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

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6B6B6B] text-xs">
            © {new Date().getFullYear()} Novaa
          </p>
        </div>
      </div>
    </footer>
  );
}