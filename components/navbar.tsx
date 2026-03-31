// components/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

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

  // ── COLOR PALETTE (Cream / Black / White) ───────────────
  const colors = {
    bg: "bg-white/95",
    bgSolid: "bg-white",
    bgCream: "bg-[#F1F1F1]",
    text: "text-black",
    textMuted: "text-[#333333]",
    textLight: "text-[#666666]",
    border: "border-black/10",
    borderAccent: "border-black/20",
    hover: "hover:text-black",
    badgeBg: "bg-black",
    badgeText: "text-white",
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? `${colors.bg} backdrop-blur-md border-b ${colors.borderAccent} py-3 shadow-sm`
            : `${colors.bgSolid} border-b ${colors.border} py-5`
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* ── Left Nav Links ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-8">
            {[["Shop", "/shop"], ["Collections", "/shop"], ["About", "/contact"]].map(([label, href]) => (
              <Link 
                key={label} 
                href={href}
                className={`${colors.textMuted} ${colors.hover} text-[0.7rem] tracking-[0.2em] uppercase transition-colors font-cormorant font-medium`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Center Logo (Playfair Display) ───────────── */}
          <Link 
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-playfair text-2xl md:text-3xl font-semibold tracking-[0.15em] text-black hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            novaa
          </Link>

          {/* ── Right Icons ──────────────────────────────── */}
          <div className="flex items-center gap-5 ml-auto">

            {/* Search */}
            <button 
              aria-label="Search" 
              className={`hidden md:block ${colors.textMuted} ${colors.hover} transition-colors`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Account */}
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  href={user.role === "ADMIN" ? "/admin" : "/account/orders"}
                  className={`${colors.textMuted} ${colors.hover} transition-colors`}
                  aria-label="Account"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`${colors.textLight} hover:text-black text-[0.65rem] tracking-[0.15em] uppercase transition-colors font-cormorant font-medium`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/login"
                className={`hidden md:block ${colors.textMuted} ${colors.hover} transition-colors`} 
                aria-label="Sign in"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </Link>
            )}

            {/* Cart with badge */}
            <Link 
              href="/cart" 
              aria-label="Cart" 
              className={`relative ${colors.textMuted} ${colors.hover} transition-colors`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 ${colors.badgeBg} ${colors.badgeText} text-[0.55rem] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm`}>
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden ${colors.textMuted} ${colors.hover} transition-colors`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Menu ──────────────────────── */}
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
          <Link 
            key={label} 
            href={href}
            onClick={() => setMenuOpen(false)}
            className="font-playfair text-4xl font-semibold text-black hover:opacity-70 transition-opacity tracking-wide"
          >
            {label}
          </Link>
        ))}
        {user && (
          <button
            onClick={() => { handleLogout(); setMenuOpen(false); }}
            className={`${colors.textLight} hover:text-black text-[0.7rem] tracking-[0.15em] uppercase transition-colors mt-4 font-cormorant font-medium`}
          >
            Sign Out
          </button>
        )}
      </div>
    </>
  );
}