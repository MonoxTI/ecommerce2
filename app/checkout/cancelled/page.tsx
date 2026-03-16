"use client";
// app/checkout/cancelled/page.tsx
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CancelledContent() {
  const params  = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full border-2 border-[#6B6B6B] flex items-center justify-center mx-auto mb-6">
          <span className="text-[#6B6B6B] text-3xl">✕</span>
        </div>

        <h1 className="font-serif text-4xl text-[#F5F0E8] font-light mb-3">Payment Cancelled</h1>
        <p className="text-[#6B6B6B] text-sm tracking-widest uppercase mb-4">No charge was made</p>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6">
          Your payment was cancelled. Your cart items are still saved — you can try again when you're ready.
        </p>

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link href="/checkout"
              className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors block">
              Try Again
            </Link>
          )}
          <Link href="/cart"
            className="border border-white/[0.06] hover:border-[#C9A84C] text-[#6B6B6B] hover:text-[#C9A84C] py-3 text-xs font-medium tracking-widest uppercase transition-colors block">
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CancelledPage() {
  return <Suspense><CancelledContent /></Suspense>;
}