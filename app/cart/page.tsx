"use client";
// app/cart/page.tsx
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

export default function CartPage() {
  const router     = useRouter();
  const { token }  = useAuthStore();
  const { cart, isLoading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => { if (token) fetchCart(token); }, [token]);

  if (!token) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-20">
      <div className="text-center">
        <p className="text-[#6B6B6B] mb-4">Please sign in to view your cart</p>
        <Link href="/auth/login" className="bg-[#C9A84C] text-[#0A0A0A] px-6 py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#E2C97E] transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-white/[0.06]">
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Your Selection</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Shopping Cart</h1>
        </div>

        {isEmpty ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">🛍</div>
            <p className="text-[#6B6B6B] mb-6 text-lg">Your cart is empty</p>
            <Link href="/shop" className="bg-[#C9A84C] text-[#0A0A0A] px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#E2C97E] transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-[#111111] border border-white/[0.06] p-4 flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-28 bg-[#1A1A1A] flex-shrink-0 overflow-hidden">
                    {item.product.image
                      ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[#252525]" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-[#F5F0E8] text-sm font-medium leading-tight">{item.product.name}</h3>
                        <p className="text-[#6B6B6B] text-xs mt-1">
                          {item.variant.color && `${item.variant.color}`}
                          {item.variant.length && ` · ${item.variant.length}"`}
                          {item.variant.laceType && ` · ${item.variant.laceType}`}
                        </p>
                        <p className="text-xs text-[#6B6B6B] mt-0.5">SKU: {item.variant.sku}</p>
                      </div>
                      <p className="text-[#C9A84C] font-serif text-lg flex-shrink-0">{formatPrice(item.lineTotal)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty stepper */}
                      <div className="flex items-center border border-white/[0.06]">
                        <button
                          onClick={() => token && updateItem(item.id, item.quantity - 1, token)}
                          className="w-8 h-8 text-[#C8BFB0] hover:text-[#C9A84C] transition-colors text-lg"
                        >−</button>
                        <span className="w-8 text-center text-[#F5F0E8] text-sm">{item.quantity}</span>
                        <button
                          onClick={() => token && updateItem(item.id, item.quantity + 1, token)}
                          className="w-8 h-8 text-[#C8BFB0] hover:text-[#C9A84C] transition-colors text-lg"
                        >+</button>
                      </div>

                      <button
                        onClick={() => token && removeItem(item.id, token)}
                        className="text-[#6B6B6B] hover:text-red-400 text-xs tracking-wider uppercase transition-colors"
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
              <div className="bg-[#111111] border border-white/[0.06] p-6 sticky top-24">
                <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5 pb-5 border-b border-white/[0.06]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Subtotal ({cart.itemCount} items)</span>
                    <span className="text-[#F5F0E8]">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Shipping</span>
                    <span className="text-[#F5F0E8]">
                      {cart.subtotal >= 100000 ? <span className="text-[#C9A84C]">Free</span> : "R99"}
                    </span>
                  </div>
                  {cart.subtotal < 100000 && (
                    <p className="text-xs text-[#6B6B6B]">
                      Add {formatPrice(100000 - cart.subtotal)} more for free shipping
                    </p>
                  )}
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-[#F5F0E8] font-medium">Total</span>
                  <span className="font-serif text-xl text-[#C9A84C]">
                    {formatPrice(cart.subtotal + (cart.subtotal >= 100000 ? 0 : 9900))}
                  </span>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors"
                >
                  Proceed to Checkout
                </button>

                <Link href="/shop" className="block text-center text-[#6B6B6B] hover:text-[#C9A84C] text-xs tracking-widest uppercase mt-4 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}