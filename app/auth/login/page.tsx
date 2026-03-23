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

  // Light theme color palette (consistent with site-wide styles)
  const colors = {
    bg: "bg-[#FAFAFA]",
    card: "bg-white",
    text: "text-[#1A1A1A]",
    textMuted: "text-[#666666]",
    textLight: "text-[#888888]",
    accent: "text-[#C9A84C]",
    accentBg: "bg-[#C9A84C]",
    accentBgHover: "hover:bg-[#B8963C]",
    border: "border-[#E5E5E5]",
    inputBg: "bg-white",
    inputBorder: "border-[#E5E5E5]",
    inputFocus: "focus:border-[#C9A84C]",
    errorBg: "bg-red-50",
    errorBorder: "border-red-200",
    errorText: "text-red-600",
  };

  return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center px-4 pt-20`}>
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <p className={`${colors.textLight} text-sm mt-2 tracking-widest uppercase`}>Welcome back</p>
        </div>

        {/* Card */}
        <div className={`border ${colors.border} ${colors.card} p-8 shadow-sm rounded-sm`}>
          <h1 className={`font-serif text-2xl ${colors.text} font-light mb-6`}>Sign In</h1>

          {error && (
            <div className={`mb-5 px-4 py-3 ${colors.errorBg} border ${colors.errorBorder} ${colors.errorText} text-sm rounded-sm`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block ${colors.textLight} text-xs tracking-widest uppercase mb-2`}>Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full ${colors.inputBg} border ${colors.inputBorder} ${colors.text} px-4 py-3 text-sm outline-none ${colors.inputFocus} transition-colors placeholder:${colors.textLight} rounded-sm focus:ring-1 focus:ring-[#C9A84C]/30`}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`${colors.textLight} text-xs tracking-widest uppercase`}>Password</label>
                <Link href="/forgot-password" className={`${colors.accent} text-xs hover:underline`}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={`w-full ${colors.inputBg} border ${colors.inputBorder} ${colors.text} px-4 py-3 text-sm outline-none ${colors.inputFocus} transition-colors placeholder:${colors.textLight} rounded-sm focus:ring-1 focus:ring-[#C9A84C]/30`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${colors.accentBg} ${colors.accentBgHover} text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 rounded-sm shadow-sm`}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className={`mt-6 pt-6 border-t ${colors.border} text-center`}>
            <p className={`${colors.textMuted} text-sm`}>
              Don't have an account?{" "}
              <Link href="/auth/register" className={`${colors.accent} hover:underline`}>Create one</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}