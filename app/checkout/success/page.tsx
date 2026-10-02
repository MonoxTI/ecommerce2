"use client";
// app/checkout/success/page.tsx

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const params  = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  // Poll order status for up to 10 seconds to confirm PAID (webhook may arrive slightly after redirect)
  useEffect(() => {
    if (!orderId) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res  = await fetch(`/api/orders/${orderId}`, { credentials: "include" });
        const json = await res.json();
        const status = json?.data?.status;
        if (status === "PAID") {
          setOrderStatus("PAID");
          clearInterval(interval);
        } else if (attempts >= 10) {
          // After 10 attempts (5 seconds) show success anyway — webhook will still arrive
          setOrderStatus("PENDING");
          clearInterval(interval);
        }
      } catch {
        if (attempts >= 10) clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#F1F1F1] flex items-center justify-center px-4 pt-20 pb-16 font-cormorant">
      <div className="text-center max-w-md w-full">

        {/* Success icon */}
        <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-6">
          <span className="text-black text-3xl">✓</span>
        </div>

        <h1 className="font-serif text-5xl text-black font-light mb-3">Order Confirmed</h1>
        <p className="text-black/60 text-sm tracking-widest uppercase mb-6">Payment Successful</p>

        <div className="h-px bg-gradient-to-r from-transparent via-black/20 to-transparent mb-6" />

        <p className="text-[#555] text-sm leading-relaxed mb-2">
          Thank you! Your payment was received and your order is being prepared.
        </p>

        {orderId && (
          <p className="text-black/40 text-xs mb-6">
            Order ID:{" "}
            <span className="text-black font-mono">{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}

        {orderStatus && (
          <div className={`inline-block px-4 py-1.5 text-xs tracking-widest uppercase mb-6 ${
            orderStatus === "PAID"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-yellow-50 border border-yellow-200 text-yellow-700"
          }`}>
            {orderStatus === "PAID" ? "✓ Payment confirmed" : "Processing payment…"}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link href={`/account/orders/${orderId}`}
              className="bg-black hover:opacity-80 text-white py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-opacity block">
              View Order
            </Link>
          )}
          <Link href="/shop"
            className="border border-black/10 hover:border-black text-black/60 hover:text-black py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-colors block">
            Continue Shopping
          </Link>
        </div>

        <p className="text-black/30 text-xs mt-8 leading-relaxed">
          A confirmation email has been sent to your email address.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}