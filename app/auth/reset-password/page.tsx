"use client";
// app/auth/reset-password/page.tsx
// User lands here from the email link: /auth/reset-password?token=xxx

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function ResetContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const token   = params.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const [showPw, setShowPw]       = useState(false);

  // Password strength
  const hasLength  = password.length >= 8;
  const hasUpper   = /[A-Z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);
  const strength   = [hasLength, hasUpper, hasNumber].filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!token)           return setError("Invalid or missing reset token. Please request a new link.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (strength < 2)    return setError("Please choose a stronger password.");

    setLoading(true);
    const res  = await fetch("/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, newPassword: password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error ?? "Failed to reset password. The link may have expired.");
    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 3000);
  }

  if (!token) return (
    <div className="min-h-screen bg-[#F1F1F1] flex items-center justify-center px-4 pt-20">
      <div className="bg-white border border-black/8 p-8 max-w-md w-full text-center">
        <h1 className="font-serif text-2xl text-black font-light mb-3">Invalid link</h1>
        <p className="text-[#666] text-sm mb-6">This password reset link is invalid or has expired.</p>
        <Link href="/auth/forgot-password"
          className="bg-black text-white px-6 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">
          Request New Link
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F1F1] flex items-center justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <Link href="/">
            <img src="/3.png" alt="novaa" className="h-14 w-auto object-contain mx-auto"
              style={{ mixBlendMode: "multiply" }} />
          </Link>
        </div>

        <div className="bg-white border border-black/8 p-8 md:p-10">

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-black/20 flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl text-black font-light mb-3">Password updated</h1>
              <p className="text-[#666] text-sm">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-serif text-3xl text-black font-light mb-2">Set new password</h1>
                <p className="text-[#666] text-sm">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-black/60 text-xs tracking-[0.14em] uppercase mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} required value={password}
                      onChange={e => setPassword(e.target.value)} minLength={8}
                      placeholder="Min. 8 characters"
                      className="w-full bg-[#F8F8F8] border border-black/10 text-black px-4 py-3 text-sm outline-none focus:border-black transition-colors placeholder:text-black/30 pr-12"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors">
                      {showPw
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : "bg-black/10"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-black/50 mt-1">{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-black/60 text-xs tracking-[0.14em] uppercase mb-2">
                    Confirm Password
                  </label>
                  <input type={showPw ? "text" : "password"} required value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className={`w-full bg-[#F8F8F8] border text-black px-4 py-3 text-sm outline-none focus:border-black transition-colors placeholder:text-black/30 ${
                      confirm && password !== confirm ? "border-red-300" : "border-black/10"
                    }`}
                  />
                  {confirm && password !== confirm && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-black hover:opacity-80 text-white py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-opacity disabled:opacity-50">
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetContent /></Suspense>;
}