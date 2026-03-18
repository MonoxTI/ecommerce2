"use client";
// app/login/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await authApi.login(form);
    setLoading(false);
    if (error) return setError(error);
    if (data) {
      setAuth(data.user, data.accessToken);
      router.push(data.user.role === "ADMIN" ? "/admin" : "/account/profile");
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block font-serif text-3xl tracking-[0.2em] text-[#F5F0E8]">
            <span className="text-[#C9A84C]">Nova</span>
          </Link>
          <p className="text-[#6B6B6B] text-sm mt-2 tracking-widest uppercase">Welcome back</p>
        </div>

        {/* Card */}
        <div className="border border-white/[0.06] bg-[#111111] p-8">
          <h1 className="font-serif text-2xl text-[#F5F0E8] font-light mb-6">Sign In</h1>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B]"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#6B6B6B] text-xs tracking-widest uppercase">Password</label>
                <Link href="/forgot-password" className="text-[#C9A84C] text-xs hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[#6B6B6B] text-sm">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-[#C9A84C] hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}