"use client";
// app/admin/layout.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  { href: "/admin",            label: "Dashboard",  icon: "▦" },
  { href: "/admin/orders",     label: "Orders",     icon: "📦" },
  { href: "/admin/products",   label: "Products",   icon: "✦" },
  { href: "/admin/customers",  label: "Customers",  icon: "👤" },
  { href: "/admin/inventory",  label: "Inventory",  icon: "📊" },
  { href: "/admin/coupons",      label: "Coupons",      icon: "🏷" },
  { href: "/admin/collections",  label: "Shop by Type", icon: "🖼" },
  { href: "/admin/services",     label: "Services",     icon: "✂" },
];

// ── COLOR PALETTE (Cream / Black / White) ─────────────────
const colors = {
  bg: "bg-[#F1F1F1]",
  bgSidebar: "bg-white",
  bgMain: "bg-[#F1F1F1]",
  bgHover: "hover:bg-[#F1F1F1]",
  bgActive: "bg-black/5",
  
  text: "text-black",
  textMuted: "text-[#333333]",
  textLight: "text-[#666666]",
  
  border: "border-black/10",
  borderLight: "border-black/5",
  borderActive: "border-black",
  
  // Shadows & depth
  shadow: "shadow-sm",
  shadowSidebar: "shadow-[2px_0_8px_0_rgb(0_0_0/0.04)]",
  
  // Active link styling (black border left + subtle bg)
  activeLink: "bg-black/5 border-l-2 border-black text-black font-medium",
  inactiveLink: "text-[#666666] hover:bg-[#F1F1F1] hover:text-black",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router              = useRouter();
  const pathname            = usePathname();
  const { user }     = useAuthStore();
  const [ready, setReady]   = React.useState(false);

  useEffect(() => {
    // Wait one tick for Zustand to rehydrate from localStorage
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    else if (user && user.role !== "ADMIN") router.push("/account/orders");
  }, [ready, user]);

  // Show nothing while rehydrating
  if (!ready || !user || user.role !== "ADMIN") return (
    <div className="fixed inset-x-0 top-16 bottom-0 bg-[#F1F1F1] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    // Fixed to the space under the top bar: sidebar + content always fit the screen,
    // and only the content area scrolls.
    <div className={`fixed inset-x-0 top-16 bottom-0 ${colors.bg} font-cormorant flex overflow-hidden`}>
      
      {/* Sidebar */}
      <aside className={`w-14 md:w-56 shrink-0 h-full ${colors.bgSidebar} border-r ${colors.border} flex flex-col ${colors.shadowSidebar}`}>
        
        {/* Logo */}
        <div className={`hidden md:block px-5 py-4 border-b ${colors.border}`}>
          <Link 
            href="/" 
            className="font-playfair text-xl font-semibold tracking-[0.15em] uppercase text-black hover:opacity-70 transition-opacity block"
          >
            Nova<span className="italic font-light">a</span>
          </Link>
          <p className={`${colors.textLight} text-xs mt-1 tracking-widest uppercase font-cormorant`}>
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 md:px-3 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link 
                key={href} 
                href={href}
                className={`flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2 text-sm transition-all duration-150 rounded-sm font-cormorant ${
                  active
                    ? colors.activeLink
                    : `${colors.inactiveLink}`
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="tracking-wide hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={`hidden md:block px-5 py-3 border-t ${colors.border} ${colors.bgHover} transition-colors`}>
          <p className={`${colors.text} text-xs font-medium truncate font-cormorant`}>{user.name}</p>
          <p className={`${colors.textLight} text-xs truncate font-cormorant`}>{user.email}</p>
          <Link 
            href="/" 
            className={`${colors.text} text-xs tracking-wider uppercase mt-2 inline-block hover:opacity-70 transition-opacity font-cormorant`}
          >
            ← Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 h-full overflow-y-auto p-4 md:p-6 ${colors.bgMain}`}>
        {/* Page Header / Breadcrumb */}
        <div className="mb-4">
          <nav className="text-xs text-[#666666] font-cormorant">
            <Link href="/admin" className="hover:text-black transition-colors">Admin</Link>
            {pathname !== "/admin" && (
              <>
                <span className="mx-2">/</span>
                <span className={colors.text}>{pathname.split("/").pop()}</span>
              </>
            )}
          </nav>
        </div>
        
        {children}
      </main>
    </div>
  );
}