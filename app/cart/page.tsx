// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

// ─── HELPERS ─────────────────────────────────────────────────
function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, fetchCart, updateItem, removeItem } = useCartStore();

  // Zustand persisted state hydrates async — wait for it before reading token
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    fetchCart();
  }, [hydrated]);

  // ── COLOR PALETTE (Cream / Black / White) ─────────────────
  const colors = {
    bg: "bg-[#F1F1F1]",
    bgCard: "bg-white",
    bgAlt: "bg-[#F1F1F1]",
    text: "text-black",
    textMuted: "text-[#333333]",
    textLight: "text-[#666666]",
    border: "border-black/10",
    borderHover: "hover:border-black",
    hover: "hover:text-black",
    buttonBg: "bg-black",
    buttonHover: "hover:bg-[#333333]",
    free: "text-[#2A6B3C]", // Green for free shipping
    error: "text-red-600",
    divider: "from-transparent via-black/20 to-transparent",
  };

  // Still waiting for Zustand rehydration
  if (!hydrated || isLoading) {
    return (
      <div className={`min-h-screen ${colors.bg} pt-24 pb-16`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`mb-8 pb-6 border-b ${colors.border}`}>
            <p className="text-black text-xs tracking-[0.2em] uppercase font-cormorant font-medium mb-1">Your Selection</p>
            <h1 className="font-playfair text-4xl text-black font-semibold">Shopping Cart</h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className={`h-28 ${colors.bgCard} border ${colors.border} animate-pulse`} />)}
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!hydrated || (!cart && !isLoading)) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center pt-20`}>
        <div className="text-center">
          <p className="font-playfair text-2xl text-black font-semibold mb-2">Your cart awaits</p>
          <p className={`${colors.textLight} text-sm mb-6 font-cormorant`}>Sign in to view your saved items</p>
          <Link 
            href="/auth/login" 
            className={`${colors.buttonBg} ${colors.buttonHover} text-white px-8 py-3 text-xs tracking-widest uppercase font-medium transition-colors font-cormorant`}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const isEmpty   = !cart || cart.items.length === 0;
  const shipping  = (cart?.subtotal ?? 0) >= 100000 ? 0 : 9900;
  const total     = (cart?.subtotal ?? 0) + shipping;

  return (
    <div className={`min-h-screen ${colors.bg} pt-24 pb-16 font-cormorant`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className={`mb-8 pb-6 border-b ${colors.border}`}>
          <p className="text-black text-xs tracking-[0.2em] uppercase font-cormorant font-medium mb-1">Your Selection</p>
          <h1 className="font-playfair text-4xl text-black font-semibold">
            Shopping Cart
            {!isEmpty && (
              <span className={`${colors.textLight} font-cormorant text-lg ml-3`}>
                ({cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""})
              </span>
            )}
          </h1>
        </div>

        {isEmpty ? (
          <div className="text-center py-20">
            <div className={`w-16 h-16 border ${colors.border} flex items-center justify-center mx-auto mb-6`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={colors.textLight} aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <p className="font-playfair text-2xl text-black font-semibold mb-2">Your cart is empty</p>
            <p className={`${colors.textLight} text-sm mb-8`}>Discover our luxury wig collection</p>
            <Link 
              href="/shop" 
              className={`${colors.buttonBg} ${colors.buttonHover} text-white px-8 py-3 text-xs tracking-widest uppercase font-medium transition-colors font-cormorant`}
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`${colors.bgCard} border ${colors.border} p-4 flex gap-4`}
                >
                  <div className="w-24 h-28 bg-[#F1F1F1] flex-shrink-0 overflow-hidden border border-black/5">
                    {item.product.image
                      ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" loading="lazy" />
                      : <div className="w-full h-full bg-[#E5E5E5]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link 
                          href={`/shop/${item.product.slug}`}
                          className={`${colors.text} text-sm font-medium leading-tight ${colors.hover} transition-colors font-cormorant`}
                        >
                          {item.product.name}
                        </Link>
                        <p className={`${colors.textLight} text-xs mt-1`}>
                          {[item.variant.color, item.variant.length && `${item.variant.length}"`, item.variant.laceType].filter(Boolean).join(" · ")}
                        </p>
                        <p className={`${colors.textLight} text-xs mt-0.5 font-mono`}>SKU: {item.variant.sku}</p>
                      </div>
                      <p className="font-playfair text-black text-lg font-medium flex-shrink-0">{formatPrice(item.lineTotal)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className={`flex items-center border ${colors.border} font-cormorant`}>
                        <button 
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          className={`w-8 h-8 text-[#666666] ${colors.hover} transition-colors text-lg leading-none`}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="w-8 text-center text-black text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className={`w-8 h-8 text-[#666666] ${colors.hover} transition-colors text-lg leading-none`}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className={`${colors.textLight} hover:text-red-600 text-xs tracking-wider uppercase transition-colors font-cormorant`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className={`${colors.bgCard} border ${colors.border} p-6 sticky top-24`}>
                <h2 className="font-playfair text-xl text-black font-semibold mb-5">Order Summary</h2>
                <div className={`space-y-3 mb-5 pb-5 border-b ${colors.border}`}>
                  <div className="flex justify-between text-sm font-cormorant">
                    <span className={colors.textLight}>Subtotal ({cart.itemCount} items)</span>
                    <span className={colors.text}>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-cormorant">
                    <span className={colors.textLight}>Shipping</span>
                    <span className={shipping === 0 ? colors.free : colors.text}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  {cart.subtotal < 100000 && (
                    <p className="text-xs text-[#666666] font-cormorant">
                      Add {formatPrice(100000 - cart.subtotal)} more for free shipping
                    </p>
                  )}
                </div>
                <div className="flex justify-between mb-6">
                  <span className={`${colors.text} font-medium font-cormorant`}>Total</span>
                  <span className="font-playfair text-xl text-black font-semibold">{formatPrice(total)}</span>
                </div>
                <button 
                  onClick={() => router.push("/checkout")}
                  className={`w-full ${colors.buttonBg} ${colors.buttonHover} text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors font-cormorant`}
                >
                  Proceed to Checkout
                </button>
                <Link 
                  href="/shop" 
                  className={`block text-center ${colors.textLight} ${colors.hover} text-xs tracking-widest uppercase mt-4 transition-colors font-cormorant`}
                >
                  Continue Shopping
                </Link>
                <div className={`mt-5 pt-5 border-t ${colors.border} space-y-2`}>
                  {["🔒 Secure checkout via PayFast", "↩ 14-day hassle-free returns", "✦ 100% virgin human hair"].map(t => (
                    <p key={t} className={`${colors.textLight} text-xs font-cormorant`}>{t}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}