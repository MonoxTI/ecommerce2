"use client";
// app/register/page.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
// ── FONT IMPORTS (add to your layout.tsx or use locally) ──
// import { Playfair_Display, Inter } from "next/font/google";
// const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setLoading(true);
    const { error } = await authApi.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    setLoading(false);
    if (error) return setError(error);
    router.push("/auth/login?registered=1");
  }

  // Light theme + font variables (ensure these CSS variables are defined in :root)
  const styles = {
    // Colors (light theme)
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
    inputFocus: "focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30",
    errorBg: "bg-red-50",
    errorBorder: "border-red-200",
    errorText: "text-red-600",
    
    // Font classes (using CSS variables from next/font)
    fontHeading: "font-[var(--font-playfair)]",  // Playfair Display for headings
    fontBody: "font-[var(--font-inter)]",         // Inter for body text
  };

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className={`block ${styles.textLight} ${styles.fontBody} text-xs tracking-widest uppercase mb-2`}>
        {label}
      </label>
      <input
        type={type} required
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full ${styles.inputBg} ${styles.fontBody} border ${styles.inputBorder} ${styles.text} px-4 py-3 text-sm outline-none ${styles.inputFocus} transition-colors placeholder:${styles.textLight} rounded-sm`}
      />
    </div>
  );

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.fontBody} flex items-center justify-center px-4 pt-20 pb-10`}>
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <p className={`${styles.textLight} text-sm mt-2 tracking-widest uppercase ${styles.fontBody}`}>Create your account</p>
        </div>

        {/* Card */}
        <div className={`border ${styles.border} ${styles.card} p-8 shadow-sm rounded-sm`}>
          <h1 className={`${styles.fontHeading} text-2xl ${styles.text} font-light mb-6`}>Register</h1>

          {error && (
            <div className={`mb-5 px-4 py-3 ${styles.errorBg} border ${styles.errorBorder} ${styles.errorText} text-sm rounded-sm ${styles.fontBody}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {field("name",    "Full Name",       "text",     "Jane Doe")}
            {field("email",   "Email Address",   "email",    "jane@example.com")}
            {field("phone",   "Phone Number",    "tel",      "0821234567")}
            {field("password","Password",        "password", "Min 8 chars, 1 uppercase, 1 number")}
            {field("confirm", "Confirm Password","password", "••••••••")}

            <p className={`${styles.textLight} text-xs ${styles.fontBody}`}>
              Password must be at least 8 characters with an uppercase letter, number, and special character.
            </p>

            <button
              type="submit" disabled={loading}
              className={`w-full ${styles.accentBg} ${styles.accentBgHover} text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 rounded-sm shadow-sm ${styles.fontBody}`}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className={`mt-6 pt-6 border-t ${styles.border} text-center`}>
            <p className={`${styles.textMuted} text-sm ${styles.fontBody}`}>
              Already have an account?{" "}
              <Link href="/auth/login" className={`${styles.accent} hover:underline`}>Sign in</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}