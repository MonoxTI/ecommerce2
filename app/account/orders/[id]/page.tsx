"use client";
// app/account/orders/[id]/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ordersApi, Order } from "@/lib/api";

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PAID:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHIPPED:   "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

function StatusTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") return (
    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20">
      <span className="text-red-400 text-lg">✕</span>
      <div>
        <p className="text-red-400 text-sm font-medium">Order Cancelled</p>
        <p className="text-red-400/70 text-xs mt-0.5">This order has been cancelled</p>
      </div>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-start">
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= currentStep;
        const current = i === currentStep;
        const last    = i === STATUS_STEPS.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                done ? "bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]" : "border-white/[0.12] text-[#6B6B6B]"
              }`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[0.65rem] tracking-wider uppercase mt-2 whitespace-nowrap ${
                current ? "text-[#C9A84C]" : done ? "text-[#F5F0E8]" : "text-[#6B6B6B]"
              }`}>
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </div>
            {!last && <div className={`flex-1 h-px mx-2 mb-5 ${i < currentStep ? "bg-[#C9A84C]" : "bg-white/[0.08]"}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const params            = useParams();
  const router            = useRouter();
  const { getValidToken } = useAuthStore();
  const orderId           = params.id as string;

  const [order, setOrder]         = useState<Order | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    async function load() {
      const token = await getValidToken();
      if (!token) { router.push("/auth/login?redirect=/account/orders"); return; }
      const { data, error } = await ordersApi.get(orderId, token);
      if (error || !data) setNotFound(true);
      else setOrder(data);
      setLoading(false);
    }
    load();
  }, [orderId]);

  async function handleCancel() {
    if (!confirm("Cancel this order? Stock will be restored.")) return;
    setCancelling(true); setCancelError("");
    const token = await getValidToken();
    if (!token) return;
    const { error } = await ordersApi.cancel(orderId, token);
    setCancelling(false);
    if (error) return setCancelError(error);
    setOrder(o => o ? { ...o, status: "CANCELLED" } : o);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-20">
      <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !order) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-20 text-center">
      <div>
        <p className="font-serif text-3xl text-[#6B6B6B] font-light mb-4">Order not found</p>
        <Link href="/account/orders" className="text-[#C9A84C] text-xs tracking-widest uppercase hover:underline">← Back to Orders</Link>
      </div>
    </div>
  );

  const shipping  = order.total >= 100000 ? 0 : 9900;
  const canCancel = order.status === "PENDING";

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-white/[0.06]">
          <Link href="/account/orders" className="text-[#6B6B6B] hover:text-[#C9A84C] text-xs tracking-widest uppercase transition-colors flex items-center gap-2 mb-4">
            ← Back to Orders
          </Link>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">Order</p>
              <h1 className="font-serif text-3xl text-[#F5F0E8] font-light">#{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className="text-[#6B6B6B] text-sm mt-1">
                {new Date(order.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1.5 border ${STATUS_STYLES[order.status] ?? ""}`}>{order.status}</span>
              {canCancel && (
                <button onClick={handleCancel} disabled={cancelling}
                  className="border border-red-800/40 text-red-400 hover:bg-red-950/30 px-4 py-1.5 text-xs tracking-widest uppercase transition-colors disabled:opacity-50">
                  {cancelling ? "Cancelling…" : "Cancel Order"}
                </button>
              )}
            </div>
          </div>
          {cancelError && <p className="text-red-400 text-sm mt-3">{cancelError}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Status timeline */}
            <div className="bg-[#111111] border border-white/[0.06] p-5">
              <h2 className="font-serif text-lg text-[#F5F0E8] font-light mb-5">Order Progress</h2>
              <StatusTimeline status={order.status} />
              {order.trackingNumber && (
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Tracking Number</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5F0E8] text-sm font-mono">{order.trackingNumber}</span>
                    {order.trackingUrl && (
                      <a href={order.trackingUrl} target="_blank" rel="noreferrer"
                        className="text-[#C9A84C] text-xs tracking-widest uppercase hover:underline">Track Package →</a>
                    )}
                  </div>
                  {order.shippedAt && (
                    <p className="text-[#6B6B6B] text-xs mt-1">
                      Shipped {new Date(order.shippedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long" })}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-[#111111] border border-white/[0.06] p-5">
              <h2 className="font-serif text-lg text-[#F5F0E8] font-light mb-4">Items ({order.items?.length ?? 0})</h2>
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <div className="w-16 h-20 bg-[#1A1A1A] flex-shrink-0 overflow-hidden">
                      {(item.variant as any)?.product?.images?.[0] ? (
                        <img src={(item.variant as any).product.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full bg-[#252525]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F5F0E8] text-sm font-medium">{(item.variant as any)?.product?.name ?? "Product"}</p>
                      <p className="text-[#6B6B6B] text-xs mt-1">
                        {item.variant?.color && item.variant.color}
                        {item.variant?.length && ` · ${item.variant.length}"`}
                        {item.variant?.laceType && ` · ${item.variant.laceType}`}
                      </p>
                      <p className="text-[#6B6B6B] text-xs mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#C9A84C] font-serif">{formatPrice(item.price)}</p>
                      <p className="text-[#6B6B6B] text-xs mt-0.5">each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div className="bg-[#111111] border border-white/[0.06] p-5">
                <h2 className="font-serif text-lg text-[#F5F0E8] font-light mb-3">Shipping Address</h2>
                <div className="text-sm leading-relaxed">
                  <p className="text-[#F5F0E8] font-medium">{order.address.fullName}</p>
                  <p className="text-[#6B6B6B]">{order.address.street}</p>
                  <p className="text-[#6B6B6B]">{order.address.city}, {order.address.province} {order.address.postalCode}</p>
                  <p className="text-[#6B6B6B]">{order.address.country}</p>
                  <p className="text-[#6B6B6B] mt-1">{order.address.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#111111] border border-white/[0.06] p-5 sticky top-24">
              <h2 className="font-serif text-lg text-[#F5F0E8] font-light mb-4">Summary</h2>
              <div className="space-y-3 text-sm mb-4 pb-4 border-b border-white/[0.06]">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Subtotal</span>
                  <span className="text-[#F5F0E8]">{formatPrice(order.total - shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Shipping</span>
                  <span className={shipping === 0 ? "text-[#C9A84C]" : "text-[#F5F0E8]"}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mb-5">
                <span className="text-[#F5F0E8] font-medium">Total</span>
                <span className="font-serif text-xl text-[#C9A84C]">{formatPrice(order.total)}</span>
              </div>
              {order.payment && (
                <div className="pt-4 border-t border-white/[0.06]">
                  <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Payment</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#F5F0E8] text-sm capitalize">{order.payment.provider}</span>
                    <span className={`text-xs px-2 py-0.5 border ${
                      order.payment.status === "SUCCESS" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      order.payment.status === "PENDING" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>{order.payment.status}</span>
                  </div>
                </div>
              )}
              {order.status === "PENDING" && order.payment?.status === "PENDING" && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <Link href="/checkout"
                    className="block w-full text-center bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] py-2.5 text-xs font-medium tracking-widest uppercase transition-colors">
                    Complete Payment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}