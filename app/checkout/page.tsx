// app/checkout/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { addressesApi, ordersApi, paymentsApi, couponsApi, Address } from "@/lib/api";

// ─── HELPERS ─────────────────────────────────────────────────
function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

export default function CheckoutPage() {
  const router          = useRouter();
  const { token, user } = useAuthStore();
  const { cart }        = useCartStore();

  const [addresses, setAddresses]       = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState("");
  const [couponCode, setCouponCode]     = useState("");
  const [couponData, setCouponData]     = useState<{ discountAmount: number; discountDisplay: string } | null>(null);
  const [couponError, setCouponError]   = useState("");
  const [step, setStep]                 = useState<"address" | "review" | "paying">("address");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [payFastData, setPayFastData]   = useState<{ fields: Record<string, string>; actionUrl: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!token) { router.push("/auth/login?redirect=/checkout"); return; }
    addressesApi.list(token).then(({ data }) => {
      if (data) { setAddresses(data); if (data.length > 0) setSelectedAddr(data[0].id); }
    });
  }, [token]);

  // Auto-submit PayFast form when data arrives
  useEffect(() => {
    if (payFastData && formRef.current) formRef.current.submit();
  }, [payFastData]);

  async function applyCode() {
    if (!couponCode.trim() || !cart) return;
    setCouponError("");
    const { data, error } = await couponsApi.validate(couponCode, cart.subtotal);
    if (error) { setCouponData(null); setCouponError(error); }
    else if (data) setCouponData(data);
  }

  async function placeOrder() {
    if (!token || !selectedAddr) return;
    setLoading(true); setError("");
    const { data: order, error: orderErr } = await ordersApi.checkout(
      { addressId: selectedAddr, couponCode: couponData ? couponCode : undefined }, token
    );
    if (orderErr) { setError(orderErr); setLoading(false); return; }
    if (!order) return;

    const { data: pf, error: pfErr } = await paymentsApi.initiate(order.orderId, token);
    if (pfErr) { setError(pfErr); setLoading(false); return; }
    if (pf) { setPayFastData(pf); setStep("paying"); }
    setLoading(false);
  }

  const subtotal  = cart?.subtotal ?? 0;
  const discount  = couponData?.discountAmount ?? 0;
  const shipping  = (subtotal - discount) >= 100000 ? 0 : 9900;
  const total     = subtotal - discount + shipping;

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
    buttonDisabled: "bg-black/20",
    discount: "text-[#2A6B3C]", // Green for positive discount
    free: "text-[#2A6B3C]", // Green for "Free" shipping
    error: "text-red-600",
    errorBg: "bg-red-50",
    errorBorder: "border-red-200",
  };

  if (!token) return null;

  return (
    <div className={`min-h-screen ${colors.bg} pt-24 pb-16 font-cormorant`}>
      {/* Hidden PayFast form */}
      {payFastData && (
        <form ref={formRef} method="POST" action={payFastData.actionUrl} className="hidden">
          {Object.entries(payFastData.fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        </form>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className={`mb-8 pb-6 border-b ${colors.border}`}>
          <p className="text-black text-xs tracking-[0.2em] uppercase font-cormorant font-medium mb-1">Almost There</p>
          <h1 className="font-playfair text-4xl text-black font-semibold">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8 text-xs tracking-widest uppercase font-cormorant">
          {["address", "review", "paying"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className={`${step === s ? "text-black font-medium" : colors.textLight} transition-colors`}>
                {i + 1}. {s}
              </span>
              {i < 2 && <span className="text-black/10">—</span>}
            </div>
          ))}
        </div>

        {error && (
          <div className={`mb-6 px-4 py-3 ${colors.errorBg} ${colors.errorBorder} border ${colors.error} text-sm font-cormorant`}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Coupon */}
          <div className="lg:col-span-2 space-y-6">

            {/* Address selector */}
            <div className={`${colors.bgCard} border ${colors.border} p-6`}>
              <h2 className="font-playfair text-xl text-black font-semibold mb-5">Shipping Address</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className={`${colors.textLight} text-sm mb-4 font-cormorant`}>No saved addresses. Add one in your account.</p>
                  <a href="/account/profile" className="text-black text-xs tracking-widest uppercase hover:opacity-70 transition-opacity font-cormorant">
                    Add Address →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label 
                      key={addr.id} 
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors font-cormorant ${
                        selectedAddr === addr.id 
                          ? "border-black bg-black/5" 
                          : `${colors.border} ${colors.borderHover}`
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id} 
                        checked={selectedAddr === addr.id}
                        onChange={() => setSelectedAddr(addr.id)} 
                        className="mt-1 accent-black" 
                      />
                      <div>
                        <p className={`${colors.text} text-sm font-medium font-cormorant`}>{addr.fullName}</p>
                        <p className={`${colors.textLight} text-xs mt-1`}>{addr.street}, {addr.city}</p>
                        <p className={`${colors.textLight} text-xs`}>{addr.province}, {addr.postalCode}</p>
                        <p className={`${colors.textLight} text-xs`}>{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className={`${colors.bgCard} border ${colors.border} p-6`}>
              <h2 className="font-playfair text-xl text-black font-semibold mb-4">Promo Code</h2>
              <div className="flex gap-0">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); setCouponError(""); }}
                  placeholder="SAVE10"
                  className={`flex-1 bg-white border ${colors.border} border-r-0 text-black px-4 py-3 text-sm outline-none focus:border-black transition-colors placeholder:text-[#666666] uppercase font-cormorant`}
                />
                <button 
                  onClick={applyCode}
                  className={`bg-white border ${colors.border} px-5 text-black text-xs tracking-widest uppercase ${colors.hover} transition-colors flex-shrink-0 font-cormorant`}
                >
                  Apply
                </button>
              </div>
              {couponError && <p className={`${colors.error} text-xs mt-2 font-cormorant`}>{couponError}</p>}
              {couponData && (
                <p className={`${colors.discount} text-xs mt-2 font-cormorant`}>✓ {couponData.discountDisplay} applied!</p>
              )}
            </div>

            {/* Cart items summary */}
            <div className={`${colors.bgCard} border ${colors.border} p-6`}>
              <h2 className="font-playfair text-xl text-black font-semibold mb-4">Items ({cart?.itemCount ?? 0})</h2>
              <div className="space-y-3">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm font-cormorant">
                    <div>
                      <span className={`${colors.text} font-cormorant`}>{item.product.name}</span>
                      <span className={`${colors.textLight} ml-2`}>×{item.quantity}</span>
                      <p className={`${colors.textLight} text-xs mt-0.5`}>
                        {item.variant.color}{item.variant.length && ` · ${item.variant.length}"`}
                      </p>
                    </div>
                    <span className="font-playfair text-black font-medium">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className={`${colors.bgCard} border ${colors.border} p-6 sticky top-24`}>
              <h2 className="font-playfair text-xl text-black font-semibold mb-5">Total</h2>

              <div className={`space-y-3 mb-5 pb-5 border-b ${colors.border} text-sm font-cormorant`}>
                <div className="flex justify-between">
                  <span className={colors.textLight}>Subtotal</span>
                  <span className={colors.text}>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className={colors.textLight}>Discount</span>
                    <span className={colors.discount}>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={colors.textLight}>Shipping</span>
                  <span className={shipping === 0 ? colors.free : colors.text}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className={`${colors.text} font-medium font-cormorant`}>Total</span>
                <span className="font-playfair text-xl text-black font-semibold">{formatPrice(total)}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading || !selectedAddr || step === "paying"}
                className={`w-full ${colors.buttonBg} ${colors.buttonHover} text-white py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-cormorant`}
              >
                {loading ? "Processing…" : step === "paying" ? "Redirecting to PayFast…" : "Pay with PayFast"}
              </button>

              <div className={`mt-4 pt-4 border-t ${colors.border} space-y-2`}>
                {["🔒 Secured by PayFast", "✦ 100% Human Hair Guarantee", "↩ 14-Day Returns"].map(t => (
                  <p key={t} className={`${colors.textLight} text-xs font-cormorant`}>{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}