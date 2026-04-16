"use client";
// app/checkout/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { addressesApi, ordersApi, couponsApi, Address } from "@/lib/api";

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

// ── Design tokens (matching homepage) ─────────────────────
const colors = {
  bg: "bg-[#F1F1F1]",
  bgAlt: "bg-white",
  card: "bg-white",
  text: "text-black",
  textMuted: "text-[#333333]",
  textLight: "text-[#666666]",
  border: "border-black/5",
  borderLight: "border-black/10",
  accent: "text-black",
  accentBg: "bg-black",
  accentHover: "hover:opacity-80",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-xs tracking-[0.3em] uppercase text-black/60 font-medium">{children}</span>
      <div className="h-px flex-1 bg-black/10" />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { getValidToken } = useAuthStore();
  const { cart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<{ discountAmount: number; discountDisplay: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const token = await getValidToken();
      if (!token) { router.push("/auth/login?redirect=/checkout"); return; }
      const { data } = await addressesApi.list(token);
      if (data) { setAddresses(data); if (data.length > 0) setSelectedAddr(data[0].id); }
    }
    init();
  }, [router, getValidToken]);

  async function applyCode() {
    if (!couponCode.trim() || !cart) return;
    setCouponError("");
    const { data, error } = await couponsApi.validate(couponCode, cart.subtotal);
    if (error) { setCouponData(null); setCouponError(error); }
    else if (data) setCouponData(data);
  }

  async function handlePay() {
    if (!selectedAddr) return setError("Please select a shipping address");
    setLoading(true); setError("");

    const token = await getValidToken();
    if (!token) { router.push("/auth/login?redirect=/checkout"); return; }

    const { data: order, error: orderErr } = await ordersApi.checkout(
      { addressId: selectedAddr, couponCode: couponData ? couponCode : undefined }, token
    );
    if (orderErr || !order) { setLoading(false); return setError(orderErr ?? "Failed to create order"); }

    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId: order.orderId }),
      credentials: "include",
    });
    const pfData = await res.json();
    setLoading(false);

    if (!res.ok) return setError(pfData.error ?? "Payment initialization failed");

    const paystackData = pfData.data;
    if (!paystackData?.authorizationUrl) {
      return setError("Failed to get payment URL from Paystack. Please try again.");
    }

    sessionStorage.setItem("paystack_ref", paystackData.reference);
    sessionStorage.setItem("paystack_order", order.orderId);
    window.location.href = paystackData.authorizationUrl;
  }

  const subtotal = cart?.subtotal ?? 0;
  const discount = couponData?.discountAmount ?? 0;
  const shipping = (subtotal - discount) >= 100000 ? 0 : 9900;
  const total = subtotal - discount + shipping;

  return (
    <div className={`${colors.bg} min-h-screen pt-24 pb-16`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-black/10">
          <SectionLabel>Almost There</SectionLabel>
          <h1 className="font-serif text-4xl md:text-5xl text-black font-light">Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Address */}
            <div className={`${colors.card} ${colors.border} rounded-sm p-6`}>
              <h2 className="font-serif text-xl text-black font-light mb-5">Shipping Address</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className={`${colors.textLight} text-sm mb-4`}>No saved addresses.</p>
                  <Link href="/account/profile"
                    className="inline-flex items-center gap-2 text-black text-xs tracking-[0.15em] uppercase border-b border-transparent hover:border-black pb-0.5 transition-colors">
                    Add Address
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id}
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-all rounded-sm ${selectedAddr === addr.id ? "border-black bg-black/5" : `${colors.border} hover:border-black/20`}`}>
                      <input type="radio" name="address" value={addr.id} checked={selectedAddr === addr.id}
                        onChange={() => setSelectedAddr(addr.id)}
                        className="mt-1 accent-black" />
                      <div>
                        <p className={`${colors.text} text-sm font-medium`}>{addr.fullName}</p>
                        <p className={`${colors.textLight} text-xs mt-1`}>
                          {addr.street}, {addr.city}, {addr.province} {addr.postalCode}
                        </p>
                        <p className={`${colors.textLight} text-xs`}>{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className={`${colors.card} ${colors.border} rounded-sm p-6`}>
              <h2 className="font-serif text-xl text-black font-light mb-4">Promo Code</h2>
              <div className="flex gap-0">
                <input type="text" value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); setCouponError(""); }}
                  placeholder="WELCOME10"
                  className={`flex-1 ${colors.bgAlt} border ${colors.border} border-r-0 text-black px-4 py-3 text-sm outline-none focus:border-black uppercase placeholder:text-[#999]`}
                />
                <button onClick={applyCode}
                  className={`${colors.bgAlt} border ${colors.border} px-6 text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-black hover:text-white transition-all`}>
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-600 text-xs mt-2">{couponError}</p>}
              {couponData && <p className="text-black text-xs mt-2 font-medium">✓ {couponData.discountDisplay} applied!</p>}
            </div>

            {/* Cart items */}
            <div className={`${colors.card} ${colors.border} rounded-sm p-6`}>
              <h2 className="font-serif text-xl text-black font-light mb-4">
                Items <span className={`${colors.textLight} font-sans text-base`}>({cart?.itemCount ?? 0})</span>
              </h2>
              <div className="space-y-4">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b border-black/5 last:border-0 last:pb-0">
                    <div>
                      <span className={`${colors.text} text-sm font-medium`}>{item.product.name}</span>
                      <span className={`${colors.textLight} ml-2`}>×{item.quantity}</span>
                      <p className={`${colors.textLight} text-xs mt-1`}>
                        {item.variant.color}{item.variant.length && ` · ${item.variant.length}"`}
                      </p>
                    </div>
                    <span className="font-serif text-black">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className={`${colors.card} ${colors.border} rounded-sm p-6 sticky top-24`}>
              <h2 className="font-serif text-xl text-black font-light mb-5">Order Total</h2>
              <div className="space-y-3 mb-5 pb-5 border-b border-black/10 text-sm">
                <div className="flex justify-between">
                  <span className={colors.textLight}>Subtotal</span>
                  <span className={colors.text}>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className={colors.textLight}>Discount</span>
                    <span className="text-black font-medium">−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={colors.textLight}>Shipping</span>
                  <span className={shipping === 0 ? "text-black font-medium" : colors.text}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className={`${colors.text} font-medium`}>Total</span>
                <span className="font-serif text-2xl text-black">{formatPrice(total)}</span>
              </div>
              <button onClick={handlePay} disabled={loading || !selectedAddr}
                className={`w-full ${colors.accentBg} text-white py-4 text-xs tracking-[0.2em] uppercase font-medium ${colors.accentHover} transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}>
                {loading ? "Processing…" : "Pay with Paystack"}
              </button>
              <div className="mt-6 pt-6 border-t border-black/10 space-y-3">
                {["🔒 Secured by Paystack", "✦ 100% Human Hair Guarantee", "↩ 14-Day Returns"].map(t => (
                  <p key={t} className={`${colors.textLight} text-xs flex items-center gap-2`}>
                    <span className="w-1 h-1 rounded-full bg-black/30" />
                    {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mt-16" />
    </div>
  );
}