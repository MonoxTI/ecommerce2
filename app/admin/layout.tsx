"use client";
// app/admin/layout.tsx

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// ── FONT IMPORTS (ensure these are in your layout.tsx) ──
// import { Playfair_Display, Inter } from "next/font/google";
// const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const NAV = [
  { href: "/admin",            label: "Dashboard",  icon: "▦" },
  { href: "/admin/orders",     label: "Orders",     icon: "📦" },
  { href: "/admin/customers",  label: "Customers",  icon: "👤" },
  { href: "/admin/inventory",  label: "Inventory",  icon: "📊" },
  { href: "/admin/coupons",    label: "Coupons",    icon: "🏷" },
  { href: "/admin/products",   label: "Products",   icon: "🛍" },
];

// ── LIGHT THEME + FONT STYLES ───────────────────────────────

const styles = {
  // Colors (light theme)
  bg: "bg-[#FAFAFA]",
  bgSidebar: "bg-white",
  bgMain: "bg-[#FAFAFA]",
  bgHover: "hover:bg-[#F5F5F5]",
  bgActive: "bg-[#C9A84C]/10",
  
  text: "text-[#1A1A1A]",
  textMuted: "text-[#666666]",
  textLight: "text-[#888888]",
  accent: "text-[#C9A84C]",
  accentBorder: "border-[#C9A84C]",
  
  border: "border-[#E5E5E5]",
  borderLight: "border-[#F0F0F0]",
  
  // Shadows & depth
  shadow: "shadow-sm",
  shadowSidebar: "shadow-[2px_0_8px_0_rgb(0_0_0/0.04)]",
  
  // Fonts (using CSS variables from next/font)
  fontHeading: "font-[var(--font-playfair)]",
  fontBody: "font-[var(--font-inter)]",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router         = useRouter();
  const pathname       = usePathname();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) router.push("/login?redirect=/admin");
    else if (user && user.role !== "ADMIN") router.push("/account");
  }, [token, user]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.fontBody} flex mt-16`}>
      
      {/* Sidebar */}
      <aside className={`w-56 ${styles.bgSidebar} border-r ${styles.border} flex flex-col fixed inset-y-0 left-0 z-50 ${styles.shadowSidebar}`}>
        
        {/* Logo */}
        <div className={`px-5 py-6 border-b ${styles.border}`}>
          <Link href="/" className={`${styles.fontHeading} text-xl tracking-[0.2em] ${styles.text} block`}>
            Nova<span className={styles.accent}>a</span>
          </Link>
          <p className={`${styles.textLight} ${styles.fontBody} text-xs mt-1 tracking-widest uppercase`}>Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link 
                key={href} 
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 rounded-sm ${styles.fontBody} ${
                  active
                    ? `${styles.bgActive} ${styles.accent} ${styles.accentBorder} border-l-2 pl-[calc(0.75rem-2px)] font-medium`
                    : `${styles.textMuted} ${styles.bgHover} hover:${styles.text}`
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="tracking-wide">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={`px-5 py-4 border-t ${styles.border} ${styles.bgHover} transition-colors`}>
          <p className={`${styles.text} ${styles.fontBody} text-xs font-medium truncate`}>{user.name}</p>
          <p className={`${styles.textLight} ${styles.fontBody} text-xs truncate`}>{user.email}</p>
          <Link 
            href="/" 
            className={`${styles.accent} ${styles.fontBody} text-xs tracking-wider uppercase mt-2 inline-block hover:underline transition-colors`}
          >
            ← Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ml-56 p-8 pt-8 ${styles.bgMain}`}>
        {/* Page Header Spacer (optional breadcrumb area) */}
        <div className="mb-6">
          <nav className="text-xs text-[#888888]">
            <Link href="/admin" className="hover:text-[#C9A84C] transition-colors">Admin</Link>
            {pathname !== "/admin" && (
              <>
                <span className="mx-2">/</span>
                <span className={styles.text}>{pathname.split("/").pop()}</span>
              </>
            )}
          </nav>
        </div>
        
        {children}
      </main>
    </div>
  );
}