"use client";
// app/checkout/success/page.tsx
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params  = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-md">
        {/* Gold checkmark */}
        <div className="w-20 h-20 rounded-full border-2 border-[#C9A84C] flex items-center justify-center mx-auto mb-6">
          <span className="text-[#C9A84C] text-3xl">✓</span>
        </div>

        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light mb-3">Order Confirmed</h1>
        <p className="text-[#C9A84C] text-sm tracking-widest uppercase mb-4">Payment Successful</p>

        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mb-6" />

        <p className="text-[#6B6B6B] text-sm leading-relaxed mb-2">
          Thank you for your order! We've received your payment and will begin processing immediately.
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