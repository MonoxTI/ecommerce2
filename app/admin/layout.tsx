"use client";
// app/admin/layout.tsx
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  { href: "/admin",            label: "Dashboard",  icon: "▦" },
  { href: "/admin/orders",     label: "Orders",     icon: "📦" },
  { href: "/admin/products",   label: "Products",   icon: "✦" },
  { href: "/admin/customers",  label: "Customers",  icon: "👤" },
  { href: "/admin/inventory",  label: "Inventory",  icon: "📊" },
  { href: "/admin/coupons",    label: "Coupons",    icon: "🏷" },
];

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
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0D0D0D] border-r border-white/[0.06] flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/[0.06]">
          <Link href="/" className="font-serif text-xl tracking-[0.2em] text-[#F5F0E8]">
            Aura<span className="text-[#C9A84C]">Wig</span>
          </Link>
          <p className="text-[#6B6B6B] text-xs mt-1 tracking-widest uppercase">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-none ${
                  active
                    ? "bg-[#C9A84C]/10 text-[#C9A84C] border-l-2 border-[#C9A84C] pl-[calc(0.75rem-2px)]"
                    : "text-[#6B6B6B] hover:text-[#F5F0E8] hover:bg-white/[0.03]"
                }`}>
                <span className="text-base leading-none">{icon}</span>
                <span className="tracking-wide">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <p className="text-[#F5F0E8] text-xs font-medium truncate">{user.name}</p>
          <p className="text-[#6B6B6B] text-xs truncate">{user.email}</p>
          <Link href="/" className="text-[#C9A84C] text-xs tracking-wider uppercase mt-2 inline-block hover:underline">
            ← Storefront
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-8 pt-8">
        {children}
      </main>
    </div>
  );
}