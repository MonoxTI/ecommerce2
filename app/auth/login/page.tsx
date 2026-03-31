// app/login/page.tsx
"use client";

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

  // ── COLOR PALETTE (Cream / Black / White) ─────────────────
  const colors = {
    bg: "bg-[#F1F1F1]",
    card: "bg-white",
    text: "text-black",
    textMuted: "text-[#333333]",
    textLight: "text-[#666666]",
    border: "border-black/10",
    inputBg: "bg-white",
    inputBorder: "border-black/10",
    inputFocus: "focus:border-black focus:ring-1 focus:ring-black/10",
    errorBg: "bg-red-50",
    errorBorder: "border-red-200",
    errorText: "text-red-600",
    buttonBg: "bg-black",
    buttonHover: "hover:bg-[#333333]",
  };

  return (
    <div className={`min-h-screen ${colors.bg} font-cormorant flex items-center justify-center px-4 pt-20`}>
      <div className="w-full max-w-md">
        
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <p className={`${colors.textLight} text-sm mt-3 tracking-widest uppercase`}>
            Welcome back
          </p>
        </div>

        {/* Card */}
        <div className={`border ${colors.border} ${colors.card} p-8 shadow-sm`}>
          <h1 className={`font-playfair text-2xl ${colors.text} font-semibold mb-6`}>
            Sign In
          </h1>

          {error && (
            <div className={`mb-5 px-4 py-3 ${colors.errorBg} border ${colors.errorBorder} ${colors.errorText} text-sm rounded-sm font-cormorant`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className={`block ${colors.textLight} font-cormorant text-xs tracking-widest uppercase mb-2`}>
                Email
              </label>
              <input
                type="email" 
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full ${colors.inputBg} font-cormorant border ${colors.inputBorder} ${colors.text} px-4 py-3 text-sm outline-none ${colors.inputFocus} transition-colors placeholder:${colors.textLight} rounded-sm`}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`${colors.textLight} font-cormorant text-xs tracking-widest uppercase`}>
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-black text-xs hover:underline font-cormorant font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" 
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={`w-full ${colors.inputBg} font-cormorant border ${colors.inputBorder} ${colors.text} px-4 py-3 text-sm outline-none ${colors.inputFocus} transition-colors placeholder:${colors.textLight} rounded-sm`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${colors.buttonBg} ${colors.buttonHover} text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2 rounded-sm font-cormorant`}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Register Link */}
          <div className={`mt-6 pt-6 border-t ${colors.border} text-center`}>
            <p className={`${colors.textMuted} text-sm font-cormorant`}>
              Don't have an account?{" "}
              <Link 
                href="/auth/register" 
                className="text-black hover:underline font-medium font-cormorant"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}