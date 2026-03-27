// app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

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
    const { error } = await authApi.register({ 
      name: form.name, 
      email: form.email, 
      phone: form.phone, 
      password: form.password 
    });
    setLoading(false);
    if (error) return setError(error);
    router.push("/auth/login?registered=1");
  }

  // ── COLOR PALETTE (Cream / Black / White) ─────────────────
  const colors = {
    bg: "bg-[#F1F1F1]",
    card: "bg-white",
    text: "text-black",
    textMuted: "text-[#333333]",
    textLight: "text-[#666666]",
    border: "border-black/10",
    borderHover: "focus:border-black",
    inputBg: "bg-white",
    errorBg: "bg-red-50",
    errorBorder: "border-red-200",
    errorText: "text-red-600",
    buttonBg: "bg-black",
    buttonHover: "hover:bg-[#333333]",
  };

  // ── FORM FIELD COMPONENT ─────────────────────────────────
  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className={`block ${colors.textLight} font-cormorant text-xs tracking-widest uppercase mb-2`}>
        {label}
      </label>
      <input
        type={type} 
        required
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full ${colors.inputBg} font-cormorant border ${colors.border} ${colors.text} px-4 py-3 text-sm outline-none ${colors.borderHover} focus:ring-1 focus:ring-black/10 transition-colors placeholder:${colors.textLight} rounded-sm`}
        autoComplete={key === "password" || key === "confirm" ? "new-password" : key}
      />
    </div>
  );

  return (
    <div className={`min-h-screen ${colors.bg} font-cormorant flex items-center justify-center px-4 pt-20 pb-10`}>
      <div className="w-full max-w-md">

        {/* Card */}
        <div className={`border ${colors.border} ${colors.card} p-8 shadow-sm`}>
          <h1 className={`font-playfair text-2xl ${colors.text} font-semibold mb-6`}>
            Register
          </h1>

          {error && (
            <div className={`mb-5 px-4 py-3 ${colors.errorBg} border ${colors.errorBorder} ${colors.errorText} text-sm rounded-sm font-cormorant`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {field("name",    "Full Name",       "text",     "Jane Doe")}
            {field("email",   "Email Address",   "email",    "jane@example.com")}
            {field("phone",   "Phone Number",    "tel",      "0821234567")}
            {field("password","Password",        "password", "Min 8 characters")}
            {field("confirm", "Confirm Password","password", "Re-enter password")}

            <p className={`${colors.textLight} text-xs font-cormorant`}>
              Password must be at least 8 characters with an uppercase letter, number, and special character.
            </p>

            <button
              type="submit" 
              disabled={loading}
              className={`w-full ${colors.buttonBg} ${colors.buttonHover} text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2 rounded-sm font-cormorant`}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className={`mt-6 pt-6 border-t ${colors.border} text-center`}>
            <p className={`${colors.textMuted} text-sm font-cormorant`}>
              Already have an account?{" "}
              <Link 
                href="/auth/login" 
                className="text-black hover:underline font-medium font-cormorant"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}