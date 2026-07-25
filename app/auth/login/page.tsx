"use client";
// app/auth/login/page.tsx
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

function LoginContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const { setAuth } = useAuthStore();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPw, setShowPw]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    const { data, error } = await authApi.login({ email, password });
    setLoading(false);

    if (error || !data) return setError(error ?? "Invalid email or password");

    // No token argument — the access token lives only in the httpOnly
    // cookie set by the server. The client never sees or stores it.
    setAuth(data.user);

    // Clear Next.js's client-side route cache before navigating.
    // Without this, a protected page visited (or prefetched) earlier
    // in the session while logged out can still be served from that
    // stale cache after login, bouncing you straight back to
    // /auth/login?redirect=... even though your cookie is now valid.
    router.refresh();

    // Redirect priority:
    // 1. ?redirect= param (e.g. from checkout or a protected page)
    // 2. Admin role → /admin
    // 3. Customer → /account/orders
    const redirect = params.get("redirect");
    if (redirect && redirect.startsWith("/")) {
      router.push(redirect);
    } else if (data.user.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/account/orders");
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F1F1] flex items-center justify-center px-4 pt-20 pb-16 font-cormorant">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <Link href="/">
            <img src="/6.png" alt="novaa"
              className="h-16 w-auto object-contain mx-auto hover:opacity-70 transition-opacity" />
          </Link>
        </div>

        <div className="bg-white border border-black/10 p-8 md:p-10">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-black font-light mb-1">Welcome back</h1>
            <p className="text-[#666] text-sm">Sign in to your novaa account</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-black/60 text-xs tracking-[0.14em] uppercase mb-2">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#F8F8F8] border border-black/10 text-black px-4 py-3 text-sm outline-none focus:border-black transition-colors placeholder:text-black/30"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-black/60 text-xs tracking-[0.14em] uppercase">Password</label>
                <Link href="/auth/forgot-password"
                  className="text-black/50 hover:text-black text-xs tracking-wider uppercase transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Your password"
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
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-black hover:opacity-80 text-white py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-opacity disabled:opacity-50">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-black/8 text-center">
            <p className="text-[#666] text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-black underline underline-offset-4 hover:opacity-70 transition-opacity">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}