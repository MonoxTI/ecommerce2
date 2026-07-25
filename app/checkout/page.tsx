"use client";
// app/checkout/page.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { addressesApi, ordersApi, couponsApi, Address } from "@/lib/api";

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

export default function CheckoutPage() {
  const router            = useRouter();
  const { cart }          = useCartStore();

  const [addresses, setAddresses]     = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState("");
  const [couponCode, setCouponCode]   = useState("");
  const [couponData, setCouponData]   = useState<{ discountAmount: number; discountDisplay: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => {
    async function init() {
      const { data } = await addressesApi.list();
      if (data) { setAddresses(data); if (data.length > 0) setSelectedAddr(data[0].id); }
    }
    init();
  }, []);

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

    const { data: order, error: orderErr } = await ordersApi.checkout(
      { addressId: selectedAddr, couponCode: couponData ? couponCode : undefined }
    );
    if (orderErr || !order) { setLoading(false); return setError(orderErr ?? "Failed to create order"); }

    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.orderId }),
      credentials: "include",
    });
    const pfData = await res.json();
    setLoading(false);

    if (!res.ok) return setError(pfData.error ?? "Payment initialization failed");

    const paystackData = pfData.data;
    if (!paystackData?.authorizationUrl) {
      return setError("Failed to get payment URL. Please try again.");
    }

    sessionStorage.setItem("paystack_ref",   paystackData.reference);
    sessionStorage.setItem("paystack_order", order.orderId);
    window.location.href = paystackData.authorizationUrl;
  }

  const subtotal = cart?.subtotal ?? 0;
  const discount = couponData?.discountAmount ?? 0;
  const shipping = (subtotal - discount) >= 100000 ? 0 : 9900;
  const total    = subtotal - discount + shipping;

  return (
    <div className="min-h-screen bg-[#F1F1F1] pt-24 pb-16 font-cormorant">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-black/10">
          <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-black/40 mb-4">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>›</span>
            <Link href="/cart" className="hover:text-black transition-colors">Cart</Link>
            <span>›</span>
            <span className="text-black/70">Checkout</span>
          </nav>
          <h1 className="font-serif text-4xl text-black font-light">Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">

            {/* Shipping Address */}
            <div className="bg-white border border-black/8 p-6">
              <h2 className="font-serif text-xl text-black font-light mb-5">Shipping Address</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-black/10">
                  <p className="text-[#666] text-sm mb-3">No saved addresses</p>
                  <Link href="/account/profile"
                    className="text-black text-xs tracking-widest uppercase underline underline-offset-4 hover:opacity-70 transition-opacity">
                    Add Address →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id}
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${
                        selectedAddr === addr.id
                          ? "border-black bg-black/[0.02]"
                          : "border-black/10 hover:border-black/30"
                      }`}>
                      <input type="radio" name="address" value={addr.id}
                        checked={selectedAddr === addr.id}
                        onChange={() => setSelectedAddr(addr.id)}
                        className="mt-1 accent-black" />
                      <div>
                        <p className="text-black text-sm font-medium">{addr.fullName}</p>
                        <p className="text-[#666] text-xs mt-1 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.province} {addr.postalCode}
                        </p>
                        <p className="text-[#666] text-xs">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div className="bg-white border border-black/8 p-6">
              <h2 className="font-serif text-xl text-black font-light mb-4">Promo Code</h2>
              <div className="flex gap-0">
                <input type="text" value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); setCouponError(""); }}
                  placeholder="WELCOME10"
                  className="flex-1 bg-[#F8F8F8] border border-black/10 border-r-0 text-black px-4 py-3 text-sm outline-none focus:border-black transition-colors uppercase placeholder:text-black/30"
                />
                <button onClick={applyCode}
                  className="bg-black text-white px-5 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-600 text-xs mt-2">{couponError}</p>}
              {couponData  && <p className="text-[#2A6B3C] text-xs mt-2">✓ {couponData.discountDisplay} applied!</p>}
            </div>

            {/* Items */}
            <div className="bg-white border border-black/8 p-6">
              <h2 className="font-serif text-xl text-black font-light mb-4">
                Items ({cart?.itemCount ?? 0})
              </h2>
              <div className="space-y-4 divide-y divide-black/5">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pt-4 first:pt-0 text-sm">
                    <div>
                      <p className="text-black font-medium">{item.product.name}</p>
                      <p className="text-[#666] text-xs mt-0.5">
                        {item.variant.color}{item.variant.length && ` · ${item.variant.length}"`}
                        {" "}· Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-serif text-black">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-black/8 p-6 sticky top-24">
              <h2 className="font-serif text-xl text-black font-light mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-black/8 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666]">Subtotal</span>
                  <span className="text-black">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#666]">Discount</span>
                    <span className="text-[#2A6B3C]">−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#666]">Shipping</span>
                  <span className={shipping === 0 ? "text-[#2A6B3C]" : "text-black"}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-black font-medium">Total</span>
                <span className="font-serif text-2xl text-black">{formatPrice(total)}</span>
              </div>

              <button onClick={handlePay} disabled={loading || !selectedAddr}
                className="w-full bg-black hover:opacity-80 text-white py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? "Processing…" : "Pay with Paystack"}
              </button>

              {/* Trust badges */}
              <div className="mt-5 pt-5 border-t border-black/8 space-y-2">
                {[
                  ["🔒", "Secured by Paystack"],
                  ["✦",  "100% Human Hair Guarantee"],
                  ["↩",  "14-Day Returns"],
                ].map(([icon, text]) => (
                  <div key={text as string} className="flex items-center gap-2">
                    <span className="text-sm">{icon}</span>
                    <p className="text-[#666] text-xs">{text}</p>
                  </div>
                ))}
              </div>

              {/* Legal */}
              <div className="mt-4 pt-4 border-t border-black/8">
                <p className="text-[#888] text-[0.65rem] leading-relaxed">
                  By placing your order you agree to our{" "}
                  <Link href="/terms" className="text-black hover:underline" target="_blank">Terms</Link>,{" "}
                  <Link href="/privacy" className="text-black hover:underline" target="_blank">Privacy Policy</Link> and{" "}
                  <Link href="/returns" className="text-black hover:underline" target="_blank">Returns Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}