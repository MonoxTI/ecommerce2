// app/checkout/cancelled/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CancelledContent() {
  const params  = useSearchParams();
  const orderId = params.get("orderId");

  // ── COLOR PALETTE (Cream / Black / White) ─────────────────
  const colors = {
    bg: "bg-[#F1F1F1]",
    bgCard: "bg-white",
    text: "text-black",
    textMuted: "text-[#333333]",
    textLight: "text-[#666666]",
    border: "border-black/10",
    borderHover: "hover:border-black",
    hover: "hover:text-black",
    buttonBg: "bg-black",
    buttonHover: "hover:bg-[#333333]",
    error: "text-[#B83C3C]", // Deep red for error/cancel states
    errorBg: "bg-[#B83C3C]",
    divider: "from-transparent via-black/20 to-transparent",
  };

  return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center px-4 pt-20 font-cormorant`}>
      <div className="text-center max-w-md">
        
        {/* Red X circle for cancelled state */}
        <div className={`w-20 h-20 rounded-full border-2 ${colors.errorBg} flex items-center justify-center mx-auto mb-6`}>
          <span className="text-white text-3xl font-playfair">✕</span>
        </div>

        {/* Headline: Playfair Display */}
        <h1 className="font-playfair text-4xl text-black font-semibold mb-2">
          Payment Cancelled
        </h1>
        
        {/* Subheading: Cormorant Garamond */}
        <p className={`${colors.textLight} text-sm tracking-widest uppercase mb-4`}>
          No charge was made
        </p>

        {/* Subtle divider */}
        <div className={`h-px bg-gradient-to-r ${colors.divider} mb-6`} />

        {/* Body text */}
        <p className={`${colors.textLight} text-sm leading-relaxed mb-6`}>
          Your payment was cancelled. Your cart items are still saved — you can try again when you're ready.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {orderId && (
            <Link 
              href="/checkout"
              className={`${colors.buttonBg} ${colors.buttonHover} text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors block font-cormorant`}
            >
              Try Again
            </Link>
          )}
          <Link 
            href="/cart"
            className={`border ${colors.border} ${colors.borderHover} ${colors.textLight} ${colors.hover} py-3 text-xs font-medium tracking-widest uppercase transition-colors block font-cormorant`}
          >
            Back to Cart
          </Link>
        </div>

        {/* Reassurance messaging */}
        <div className={`mt-10 pt-6 border-t ${colors.border} space-y-2`}>
          {["🛒 Your cart is saved", "✦ No payment was processed", "🔒 Your data remains secure"].map(t => (
            <p key={t} className={`${colors.textLight} text-xs`}>{t}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CancelledPage() {
  return <Suspense><CancelledContent /></Suspense>;
}