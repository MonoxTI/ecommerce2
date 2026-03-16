"use client";
// app/checkout/page.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { addressesApi, ordersApi, paymentsApi, couponsApi, Address } from "@/lib/api";

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
    if (!token) { router.push("/login?redirect=/checkout"); return; }
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

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
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
        <div className="mb-8 pb-6 border-b border-white/[0.06]">
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Almost There</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8 text-xs tracking-widest uppercase">
          {["address", "review", "paying"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className={`${step === s ? "text-[#C9A84C]" : "text-[#6B6B6B]"} transition-colors`}>
                {i + 1}. {s}
              </span>
              {i < 2 && <span className="text-white/[0.06]">—</span>}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-950/40 border border-red-800/50 text-red-400 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Coupon */}
          <div className="lg:col-span-2 space-y-6">

            {/* Address selector */}
            <div className="bg-[#111111] border border-white/[0.06] p-6">
              <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-5">Shipping Address</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[#6B6B6B] text-sm mb-4">No saved addresses. Add one in your account.</p>
                  <a href="/account/profile" className="text-[#C9A84C] text-xs tracking-widest uppercase hover:underline">
                    Add Address →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${selectedAddr === addr.id ? "border-[#C9A84C] bg-[#C9A84C]/5" : "border-white/[0.06] hover:border-white/20"}`}>
                      <input type="radio" name="address" value={addr.id} checked={selectedAddr === addr.id}
                        onChange={() => setSelectedAddr(addr.id)} className="mt-1 accent-[#C9A84C]" />
                      <div>
                        <p className="text-[#F5F0E8] text-sm font-medium">{addr.fullName}</p>
                        <p className="text-[#6B6B6B] text-xs mt-1">{addr.street}, {addr.city}</p>
                        <p className="text-[#6B6B6B] text-xs">{addr.province}, {addr.postalCode}</p>
                        <p className="text-[#6B6B6B] text-xs">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-[#111111] border border-white/[0.06] p-6">
              <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-4">Promo Code</h2>
              <div className="flex gap-0">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); setCouponError(""); }}
                  placeholder="SAVE10"
                  className="flex-1 bg-[#1A1A1A] border border-white/[0.06] border-r-0 text-[#F5F0E8] px-4 py-3 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] uppercase"
                />
                <button onClick={applyCode}
                  className="bg-[#1A1A1A] border border-white/[0.06] px-5 text-[#C9A84C] text-xs tracking-widest uppercase hover:bg-[#252525] transition-colors flex-shrink-0"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
              {couponData && (
                <p className="text-[#C9A84C] text-xs mt-2">✓ {couponData.discountDisplay} applied!</p>
              )}
            </div>

            {/* Cart items summary */}
            <div className="bg-[#111111] border border-white/[0.06] p-6">
              <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-4">Items ({cart?.itemCount ?? 0})</h2>
              <div className="space-y-3">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-[#F5F0E8]">{item.product.name}</span>
                      <span className="text-[#6B6B6B] ml-2">×{item.quantity}</span>
                      <p className="text-[#6B6B6B] text-xs mt-0.5">
                        {item.variant.color}{item.variant.length && ` · ${item.variant.length}"`}
                      </p>
                    </div>
                    <span className="text-[#C9A84C] font-serif">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#111111] border border-white/[0.06] p-6 sticky top-24">
              <h2 className="font-serif text-xl text-[#F5F0E8] font-light mb-5">Total</h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-white/[0.06] text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Subtotal</span>
                  <span className="text-[#F5F0E8]">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B]">Discount</span>
                    <span className="text-[#C9A84C]">−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Shipping</span>
                  <span className={shipping === 0 ? "text-[#C9A84C]" : "text-[#F5F0E8]"}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-[#F5F0E8] font-medium">Total</span>
                <span className="font-serif text-xl text-[#C9A84C]">{formatPrice(total)}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading || !selectedAddr || step === "paying"}
                className="w-full bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-3 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing…" : step === "paying" ? "Redirecting to PayFast…" : "Pay with PayFast"}
              </button>

              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
                {["🔒 Secured by PayFast", "✦ 100% Human Hair Guarantee", "↩ 14-Day Returns"].map(t => (
                  <p key={t} className="text-[#6B6B6B] text-xs">{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}