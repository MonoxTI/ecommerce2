"use client";
// app/register/page.tsx
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
    const { error } = await authApi.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    setLoading(false);
    if (error) return setError(error);
    router.push("/auth/login?registered=1");
  }

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">{label}</label>
      <input
        type={type} required
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B]"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 pt-20 pb-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block font-serif text-3xl tracking-[0.2em] text-[#F5F0E8]">
            <span className="text-[#C9A84C]">Nova</span>
          </Link>
          <p className="text-[#6B6B6B] text-sm mt-2 tracking-widest uppercase">Create your account</p>
        </div>

        <div className="border border-white/[0.06] bg-[#111111] p-8">
          <h1 className="font-serif text-2xl text-[#F5F0E8] font-light mb-6">Register</h1>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {field("name",    "Full Name",       "text",     "Jane Doe")}
            {field("email",   "Email Address",   "email",    "jane@example.com")}
            {field("phone",   "Phone Number",    "tel",      "0821234567")}
            {field("password","Password",        "password", "Min 8 chars, 1 uppercase, 1 number, 1 special")}
            {field("confirm", "Confirm Password","password", "••••••••")}

            <p className="text-[#6B6B6B] text-xs">
              Password must be at least 8 characters with an uppercase letter, number, and special character.
            </p>

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[#6B6B6B] text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#C9A84C] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}