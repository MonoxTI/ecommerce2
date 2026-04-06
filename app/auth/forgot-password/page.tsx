"use client";
// app/auth/forgot-password/page.tsx

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    const res  = await fetch("/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error ?? "Something went wrong. Please try again.");
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#F1F1F1] flex items-center justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <img src="/3.png" alt="novaa" className="h-14 w-auto object-contain mx-auto"
              style={{ mixBlendMode: "multiply" }} />
          </Link>
        </div>

        <div className="bg-white border border-black/8 p-8 md:p-10">

          {sent ? (
            // ── Success state ──────────────────────────────
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-black/20 flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl text-black font-light mb-3">Check your email</h1>
              <p className="text-[#666] text-sm leading-relaxed mb-6">
                If an account exists for <strong className="text-black">{email}</strong>, we've sent a
                password reset link. Check your inbox and spam folder.
              </p>
              <p className="text-[#999] text-xs mb-6">The link expires in 1 hour.</p>
              <button onClick={() => { setSent(false); setEmail(""); }}
                className="text-black text-xs tracking-widest uppercase underline underline-offset-4 hover:opacity-60 transition-opacity">
                Try a different email
              </button>
            </div>
          ) : (
            // ── Form ──────────────────────────────────────
            <>
              <div className="mb-8">
                <h1 className="font-serif text-3xl text-black font-light mb-2">Forgot password?</h1>
                <p className="text-[#666] text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-black/60 text-xs tracking-[0.14em] uppercase mb-2">
                    Email Address
                  </label>
                  <input type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#F8F8F8] border border-black/10 text-black px-4 py-3 text-sm outline-none focus:border-black transition-colors placeholder:text-black/30"
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-black hover:opacity-80 text-white py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-opacity disabled:opacity-50">
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-black/8 text-center">
                <Link href="/auth/login"
                  className="text-black/60 hover:text-black text-xs tracking-widest uppercase transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}