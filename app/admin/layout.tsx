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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${colors.bg} font-cormorant flex mt-16`}>
      
      {/* Sidebar */}
      <aside className={`w-56 ${colors.bgSidebar} border-r ${colors.border} flex flex-col fixed inset-y-0 left-0 z-50 ${colors.shadowSidebar}`}>
        
        {/* Logo */}
        <div className={`px-5 py-6 border-b ${colors.border}`}>
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
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link 
                key={href} 
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 rounded-sm font-cormorant ${
                  active
                    ? colors.activeLink
                    : `${colors.inactiveLink}`
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="tracking-wide">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={`px-5 py-4 border-t ${colors.border} ${colors.bgHover} transition-colors`}>
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
      <main className={`flex-1 ml-56 p-8 pt-8 ${colors.bgMain}`}>
        {/* Page Header / Breadcrumb */}
        <div className="mb-6">
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