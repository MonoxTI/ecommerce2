"use client";
// components/navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const { cart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const cartCount = cart?.itemCount ?? 0;

  // Light theme color palette
  const colors = {
    bg: "bg-white/95",
    bgSolid: "bg-white",
    text: "text-[#1A1A1A]",
    textMuted: "text-[#666666]",
    textLight: "text-[#888888]",
    accent: "text-[#C9A84C]",
    accentHover: "hover:text-[#B8963C]",
    border: "border-[#E5E5E5]",
    borderAccent: "border-[#C9A84C]/20",
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? `${colors.bg} backdrop-blur-md border-b ${colors.borderAccent} py-3 shadow-sm`
          : `${colors.bgSolid} border-b ${colors.border} py-5`
      }`}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* Left nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[["Shop", "/shop"], ["Collections", "/shop"], ["About", "/about"]].map(([label, href]) => (
              <Link key={label} href={href}
                className={`${colors.textMuted} ${colors.accentHover} text-xs tracking-[0.15em] uppercase transition-colors font-medium`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Center logo */}
          <Link href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl md:text-3xl tracking-[0.22em] uppercase text-[#1A1A1A] hover:text-[#C9A84C] transition-colors whitespace-nowrap">
            Nova<span className={colors.accent}>a</span>
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-5 ml-auto">

            {/* Search */}
            <button aria-label="Search" className={`hidden md:block ${colors.textMuted} ${colors.accentHover} transition-colors`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Account */}
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link href={user.role === "ADMIN" ? "/admin" : "/account/orders"}
                  className={`${colors.textMuted} ${colors.accentHover} transition-colors`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </Link>
                <button onClick={handleLogout}
                  className={`${colors.textLight} hover:text-red-500 text-xs tracking-widest uppercase transition-colors font-medium`}>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/login"
                className={`hidden md:block ${colors.textMuted} ${colors.accentHover} transition-colors`} aria-label="Sign in">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </Link>
            )}

            {/* Cart with badge */}
            <Link href="/cart" aria-label="Cart" className={`relative ${colors.textMuted} ${colors.accentHover} transition-colors`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-white text-[0.55rem] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden ${colors.textMuted} ${colors.accentHover} transition-colors`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
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

      {/* Mobile full-screen menu - Light Theme */}
      <div className={`fixed inset-0 z-40 ${colors.bgSolid} flex flex-col items-center justify-center gap-8 transition-opacity duration-300 md:hidden ${
        menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {[
          ["Shop", "/shop"],
          ["Collections", "/shop"],
          ["Cart", "/cart"],
          ...(user
            ? [["My Account", user.role === "ADMIN" ? "/admin" : "/account/orders"]]
            : [["Sign In", "/auth/login"], ["Register", "/auth/register"]]
          ),
        ].map(([label, href]) => (
          <Link key={label} href={href}
            onClick={() => setMenuOpen(false)}
            className="font-serif text-4xl font-light text-[#1A1A1A] hover:text-[#C9A84C] transition-colors tracking-wide">
            {label}
          </Link>
        ))}
        {user && (
          <button
            onClick={() => { handleLogout(); setMenuOpen(false); }}
            className="text-[#888888] hover:text-red-500 text-sm tracking-widest uppercase transition-colors mt-4 font-medium">
            Sign Out
          </button>
        )}
      </div>
    </>
  );
}