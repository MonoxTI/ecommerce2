"use client";
// components/navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, token, logout } = useAuthStore();
  const cart = useCartStore((s) => s.cart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = cart?.itemCount ?? 0;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#C9A84C]/15 py-3"
          : "bg-transparent border-b border-transparent py-5"
      }`}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* Left — Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {[["Shop", "/shop"], ["Collections", "/shop?category=all"], ["About", "/about"]].map(([label, href]) => (
              <Link key={label} href={href}
                className="text-[#C8BFB0] hover:text-[#C9A84C] text-xs tracking-[0.15em] uppercase transition-colors duration-200">
                {label}
              </Link>
            ))}
          </div>

          {/* Right — Icons */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <button aria-label="Search"
              className="text-[#C8BFB0] hover:text-[#C9A84C] transition-colors duration-200 hidden md:block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Account */}
            <Link href= "/auth/login"
              aria-label="Account"
              className="text-[#C8BFB0] hover:text-[#C9A84C] transition-colors duration-200 hidden md:block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>

            {/* Cart */}
            <Link href="/cart" aria-label="Cart" className="relative text-[#C8BFB0] hover:text-[#C9A84C] transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-[#0A0A0A] text-[0.55rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="md:hidden text-[#C8BFB0] hover:text-[#C9A84C] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 bg-[#0A0A0A] flex flex-col items-center justify-center gap-8 transition-all duration-500 ${
        menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        {[
          ["Shop",    "/shop"],
          ["Collections", "/shop?category=all"],
          ["About",   "/about"],
          ["Cart",    "/cart"],
          user ? ["Account", user.role === "ADMIN" ? "/admin" : "/account/orders"] : ["Sign In", "/login"],
        ].map(([label, href]) => (
          <Link key={label as string} href={href as string}
            onClick={() => setMenuOpen(false)}
            className="font-serif text-4xl font-light text-[#F5F0E8] hover:text-[#C9A84C] tracking-[0.05em] transition-colors duration-200">
            {label}
          </Link>
        ))}

        {user && (
          <button
            onClick={() => { logout(); setMenuOpen(false); }}
            className="text-[#6B6B6B] hover:text-red-400 text-xs tracking-[0.15em] uppercase transition-colors mt-4">
            Sign Out
          </button>
        )}
      </div>
    </>
  );
}