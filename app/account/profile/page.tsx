"use client";
// app/account/profile/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

export default function ProfilePage() {
  const router         = useRouter();
  const { user, token, logout } = useAuthStore();
  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwError, setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirm) return setPwError("Passwords do not match");
    if (!token) return;
    setPwLoading(true);
    const { error } = await authApi.changePassword(
      { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }, token
    );
    setPwLoading(false);
    if (error) return setPwError(error);
    setPwSuccess("Password changed. Please sign in again.");
    setTimeout(() => { logout(); router.push("/login"); }, 2000);
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8 pb-6 border-b border-white/[0.06]">
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">My Account</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Profile</h1>
        </div>

        {/* Account nav */}
        <div className="flex gap-6 mb-8 text-xs tracking-widest uppercase border-b border-white/[0.06] pb-4">
          {[["Orders", "/account/orders"], ["Profile", "/account/profile"]].map(([label, href]) => (
            <Link key={label} href={href}
              className={`pb-4 -mb-4 border-b-2 transition-colors ${href === "/account/profile" ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-[#6B6B6B] hover:text-[#F5F0E8]"}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account info */}
          <div className="bg-[#111111] border border-white/[0.06] p-6">
            <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-5">Account Details</h2>
            <div className="space-y-4">
              {[["Name", user?.name], ["Email", user?.email], ["Phone", user?.phone], ["Role", user?.role], ["Member Since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-ZA", { month: "long", year: "numeric" }) : "—"]].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-3 border-b border-white/[0.06] last:border-0">
                  <span className="text-[#6B6B6B] text-xs tracking-widest uppercase">{label}</span>
                  <span className="text-[#F5F0E8] text-sm">{val ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change password */}
          <div className="bg-[#111111] border border-white/[0.06] p-6">
            <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-5">Change Password</h2>

            {pwError && <div className="mb-4 px-3 py-2 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{pwError}</div>}
            {pwSuccess && <div className="mb-4 px-3 py-2 bg-green-950/40 border border-green-800/50 text-green-400 text-sm">{pwSuccess}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {[["Current Password", "currentPassword"], ["New Password", "newPassword"], ["Confirm New Password", "confirm"]].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">{label}</label>
                  <input type="password" required
                    value={pwForm[key as keyof typeof pwForm]}
                    onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/[0.06] text-[#F5F0E8] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              ))}
              <button type="submit" disabled={pwLoading}
                className="w-full bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60">
                {pwLoading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-6 flex justify-end">
          <button onClick={handleLogout}
            className="border border-red-800/40 text-red-400 hover:bg-red-950/30 px-6 py-2 text-xs tracking-widest uppercase transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}