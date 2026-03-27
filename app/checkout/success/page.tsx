// app/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
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
    success: "text-[#2A6B3C]", // Green for success states
    successBg: "bg-[#2A6B3C]",
    divider: "from-transparent via-black/20 to-transparent",
  };

  return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center px-4 pt-20 font-cormorant`}>
      <div className="text-center max-w-md">
        
        {/* Black checkmark circle */}
        <div className={`w-20 h-20 rounded-full border-2 ${colors.successBg} flex items-center justify-center mx-auto mb-6`}>
          <span className="text-white text-3xl font-playfair">✓</span>
        </div>

        {/* Headline: Playfair Display */}
        <h1 className="font-playfair text-4xl text-black font-semibold mb-2">
          Order Confirmed
        </h1>
        
        {/* Subheading: Cormorant Garamond */}
        <p className={`${colors.success} text-sm tracking-widest uppercase mb-4 font-cormorant font-medium`}>
          Payment Successful
        </p>

        {/* Subtle divider */}
        <div className={`h-px bg-gradient-to-r ${colors.divider} mb-6`} />

        {/* Body text */}
        <p className={`${colors.textLight} text-sm leading-relaxed mb-2`}>
          Thank you for your order! We've received your payment and will begin processing immediately.
        </p>
        
        {orderId && (
          <p className={`${colors.textLight} text-xs mb-6`}>
            Order ID: <span className={`${colors.success} font-mono`}>{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {orderId && (
            <Link 
              href={`/account/orders/${orderId}`}
              className={`${colors.buttonBg} ${colors.buttonHover} text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors block font-cormorant`}
            >
              View Order
            </Link>
          )}
          <Link 
            href="/shop"
            className={`border ${colors.border} ${colors.borderHover} ${colors.textLight} ${colors.hover} py-3 text-xs font-medium tracking-widest uppercase transition-colors block font-cormorant`}
          >
            Continue Shopping
          </Link>
        </div>

        {/* Trust badges */}
        <div className={`mt-10 pt-6 border-t ${colors.border} space-y-2`}>
          {["📦 Order confirmation email sent", "✦ 100% Human Hair Guarantee", "↩ 14-Day Hassle-Free Returns"].map(t => (
            <p key={t} className={`${colors.textLight} text-xs`}>{t}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}