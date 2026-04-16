"use client";
// app/checkout/success/page.tsx
// Paystack redirects here after payment. We verify the transaction server-side.

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

function SuccessContent() {
  const params          = useSearchParams();
  const router          = useRouter();
  const { getValidToken } = useAuthStore();
  const [orderId, setOrderId] = useState<string | null>(() => params.get("orderId"));

  const [status, setStatus]   = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment…");

  useEffect(() => {
    if (!orderId) {
      const savedOrder = typeof window !== "undefined" ? sessionStorage.getItem("paystack_order") : null;
      setOrderId(savedOrder);
    }

    async function verify() {
      // Paystack appends ?reference=xxx or ?trxref=xxx to the callback URL
      const reference = params.get("reference") ?? params.get("trxref") ?? sessionStorage.getItem("paystack_ref");

      if (!reference) {
        // No reference — user may have navigated here directly after a successful payment
        setStatus("success");
        setMessage("");
        return;
      }

      try {
        const token = await getValidToken();
        if (!token) { router.push("/auth/login"); return; }

        const res = await fetch("/api/payments/verify-paystack", {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ reference }),
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          sessionStorage.removeItem("paystack_ref");
          sessionStorage.removeItem("paystack_order");
          setStatus("success");
        } else {
          setStatus("failed");
          setMessage(data.error ?? "Payment verification failed");
        }
      } catch {
        setStatus("failed");
        setMessage("Network error during verification");
      }
    }

    verify();
  }, []);

  if (status === "verifying") return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 pt-20">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#6B6B6B] text-sm">{message}</p>
      </div>
    </div>
  );

  if (status === "failed") return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full border-2 border-red-500/50 flex items-center justify-center mx-auto mb-6">
          <span className="text-red-400 text-3xl">✕</span>
        </div>
        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light mb-3">Verification Failed</h1>
        <p className="text-[#6B6B6B] text-sm mb-6">{message}</p>
        <Link href="/checkout" className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-8 py-3 text-xs tracking-widest uppercase font-medium transition-colors">
          Try Again
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full border-2 border-[#C9A84C] flex items-center justify-center mx-auto mb-6">
          <span className="text-[#C9A84C] text-3xl">✓</span>
        </div>
        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light mb-3">Order Confirmed</h1>
        <p className="text-[#C9A84C] text-sm tracking-widest uppercase mb-4">Payment Successful</p>
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mb-6" />
        <p className="text-[#6B6B6B] text-sm leading-relaxed mb-2">
          Thank you! Your payment was received and your order is being processed.
        </p>
        {orderId && (
          <p className="text-[#6B6B6B] text-xs mb-6">
            Order ID: <span className="text-[#C9A84C] font-mono">{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
        <div className="flex flex-col gap-3">
          {orderId && (
            <Link href={`/account/orders/${orderId}`}
              className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors block">
              View Order
            </Link>
          )}
          <Link href="/shop"
            className="border border-white/[0.06] hover:border-[#C9A84C] text-[#6B6B6B] hover:text-[#C9A84C] py-3 text-xs font-medium tracking-widest uppercase transition-colors block">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}