"use client";
// components/navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const router              = useRouter();
  const { user, logout }    = useAuthStore();
  const { cart }            = useCartStore();
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

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-black/10 py-2 shadow-sm"
          : "bg-white border-b border-black/5 py-3"
      }`}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex items-center justify-between h-14">

          {/* Left nav */}
          <div className="hidden md:flex items-center gap-8 flex-1">
            {[["Shop", "/shop"], ["About", "/contact"]].map(([label, href]) => (
              <Link key={label} href={href}
                className="text-[#555] hover:text-black text-[0.68rem] tracking-[0.2em] uppercase transition-colors font-medium">
                {label}
              </Link>
            ))}
          </div>

          {/* Center logo — fixed height, no margin */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <img
              src="/3.png"
              alt="novaa"
              className="h-10 md:h-35 w-auto object-contain"
              style={{ opacity: 4.5 }}
            />
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-5 flex-1 justify-end">

            <button aria-label="Search"
              className="hidden md:block text-[#555] hover:text-black transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link href={user.role === "ADMIN" ? "/admin" : "/account/orders"}
                  className="text-[#555] hover:text-black transition-colors" aria-label="Account">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </Link>
                <button onClick={handleLogout}
                  className="text-[#888] hover:text-black text-[0.62rem] tracking-[0.15em] uppercase transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/login"
                className="hidden md:block text-[#555] hover:text-black transition-colors" aria-label="Sign in">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </Link>
            )}

            <Link href="/cart" aria-label="Cart"
              className="relative text-[#555] hover:text-black transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[0.5rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden text-[#555] hover:text-black transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 transition-opacity duration-300 md:hidden ${
        menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        <img src="/3.png" alt="novaa" className="h-12 w-auto object-contain mb-4" style={{ mixBlendMode: "multiply" }} />
        {[
          ["Shop", "/shop"],
          ["Cart", "/cart"],
          ...(user
            ? [["My Account", user.role === "ADMIN" ? "/admin" : "/account/orders"]]
            : [["Sign In", "/auth/login"], ["Register", "/auth/register"]]
          ),
        ].map(([label, href]) => (
          <Link key={label} href={href} onClick={() => setMenuOpen(false)}
            className="font-serif text-4xl font-light text-black hover:opacity-60 transition-opacity tracking-wide">
            {label}
          </Link>
        ))}
        {user && (
          <button onClick={() => { handleLogout(); setMenuOpen(false); }}
            className="text-[#888] hover:text-black text-[0.68rem] tracking-[0.15em] uppercase transition-colors mt-4">
            Sign Out
          </button>
        )}
      </div>
    </>
  );
}