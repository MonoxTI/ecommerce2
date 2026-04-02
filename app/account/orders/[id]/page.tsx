// app/account/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ordersApi, Order } from "@/lib/api";

// ─── HELPERS ──────────────────────────────────────────────────
function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

// ── COLOR PALETTE (Cream / Black / White) ─────────────────
const colors = {
  bg: "bg-[#F1F1F1]",
  bgCard: "bg-white",
  bgAlt: "bg-[#F1F1F1]",
  
  text: "text-black",
  textMuted: "text-[#333333]",
  textLight: "text-[#666666]",
  
  border: "border-black/10",
  borderLight: "border-black/5",
  borderHover: "hover:border-black",
  
  buttonPrimary: "bg-black hover:bg-[#333333] text-white",
  buttonOutline: "border border-black text-black hover:bg-black hover:text-white",
  buttonDisabled: "opacity-40 cursor-not-allowed",
  
  error: "text-red-600",
  
  // Accessible status badge colors (light bg + dark text)
  statusPending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  statusPaid: "bg-blue-50 text-blue-800 border-blue-200",
  statusShipped: "bg-purple-50 text-purple-800 border-purple-200",
  statusDelivered: "bg-green-50 text-green-800 border-green-200",
  statusCancelled: "bg-red-50 text-red-800 border-red-200",
  statusDefault: "bg-[#F1F1F1] text-[#666666] border-black/10",
  
  // Timeline colors
  timelineDone: "bg-black text-white border-black",
  timelineCurrent: "border-black text-black",
  timelinePending: "border-black/20 text-[#666666]",
  timelineLineDone: "bg-black",
  timelineLinePending: "bg-black/10",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   colors.statusPending,
  PAID:      colors.statusPaid,
  SHIPPED:   colors.statusShipped,
  DELIVERED: colors.statusDelivered,
  CANCELLED: colors.statusCancelled,
};

const STATUS_STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

// ─── STATUS TIMELINE ─────────────────────────────────────────
function StatusTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") return (
    <div className={`flex items-center gap-3 p-4 ${colors.statusCancelled} rounded-sm`}>
      <span className="text-red-800 text-lg font-playfair">✕</span>
      <div>
        <p className="text-red-800 text-sm font-medium font-cormorant">Order Cancelled</p>
        <p className="text-red-800/70 text-xs mt-0.5 font-cormorant">This order has been cancelled</p>
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
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium font-cormorant ${
                done ? colors.timelineDone : colors.timelinePending
              }`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[0.65rem] tracking-wider uppercase mt-2 whitespace-nowrap font-cormorant ${
                current ? colors.text : done ? colors.text : colors.textLight
              }`}>
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </div>
            {!last && <div className={`flex-1 h-px mx-2 mb-5 ${i < currentStep ? colors.timelineLineDone : colors.timelineLinePending}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────
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
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center pt-20`}>
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !order) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center pt-20 text-center`}>
      <div>
        <p className="font-playfair text-3xl text-[#666666] font-medium mb-4">Order not found</p>
        <Link href="/account/orders" className={`${colors.text} text-xs tracking-widest uppercase hover:underline font-cormorant`}>
          ← Back to Orders
        </Link>
      </div>
    </div>
  );

  const shipping  = order.total >= 100000 ? 0 : 9900;
  const canCancel = order.status === "PENDING";

  return (
    <div className={`min-h-screen ${colors.bg} pt-24 pb-16 font-cormorant`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className={`mb-8 pb-6 border-b ${colors.border}`}>
          <Link 
            href="/account/orders" 
            className={`${colors.textLight} ${colors.borderHover} text-xs tracking-widest uppercase transition-colors flex items-center gap-2 mb-4 font-cormorant`}
          >
            ← Back to Orders
          </Link>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <p className={`${colors.text} text-xs tracking-[0.2em] uppercase mb-1 font-cormorant font-medium`}>Order</p>
              <h1 className="font-playfair text-3xl text-black font-semibold">#{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className={`${colors.textLight} text-sm mt-1`}>
                {new Date(order.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1.5 border font-cormorant rounded-sm ${
                STATUS_STYLES[order.status] ?? colors.statusDefault
              }`}>
                {order.status}
              </span>
              {canCancel && (
                <button 
                  onClick={handleCancel} 
                  disabled={cancelling}
                  className={`border border-red-200 ${colors.error} hover:bg-red-50 px-4 py-1.5 text-xs tracking-widest uppercase transition-colors disabled:${colors.buttonDisabled} font-cormorant rounded-sm`}
                >
                  {cancelling ? "Cancelling…" : "Cancel Order"}
                </button>
              )}
            </div>
          </div>
          {cancelError && <p className={`${colors.error} text-sm mt-3 font-cormorant`}>{cancelError}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Status timeline */}
            <div className={`${colors.bgCard} border ${colors.border} p-5 rounded-sm`}>
              <h2 className="font-playfair text-lg text-black font-semibold mb-5">Order Progress</h2>
              <StatusTimeline status={order.status} />
              {order.trackingNumber && (
                <div className={`mt-5 pt-5 border-t ${colors.borderLight}`}>
                  <p className={`${colors.textLight} text-xs tracking-widest uppercase mb-2 font-cormorant`}>Tracking Number</p>
                  <div className="flex items-center gap-3">
                    <span className={`${colors.text} text-sm font-mono`}>{order.trackingNumber}</span>
                    {order.trackingUrl && (
                      <a 
                        href={order.trackingUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`${colors.text} text-xs tracking-widest uppercase hover:underline font-cormorant`}
                      >
                        Track Package →
                      </a>
                    )}
                  </div>
                  {order.shippedAt && (
                    <p className={`${colors.textLight} text-xs mt-1 font-cormorant`}>
                      Shipped {new Date(order.shippedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long" })}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Items */}
            <div className={`${colors.bgCard} border ${colors.border} p-5 rounded-sm`}>
              <h2 className="font-playfair text-lg text-black font-semibold mb-4">Items ({order.items?.length ?? 0})</h2>
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className={`flex gap-4 pb-4 border-b ${colors.borderLight} last:border-0 last:pb-0`}>
                    <div className="w-16 h-20 bg-[#F1F1F1] flex-shrink-0 overflow-hidden border border-black/5 rounded-sm">
                      {(item.variant as any)?.product?.images?.[0] ? (
                        <img 
                          src={(item.variant as any).product.images[0].url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                      ) : <div className="w-full h-full bg-[#E5E5E5]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`${colors.text} text-sm font-medium font-cormorant`}>
                        {(item.variant as any)?.product?.name ?? "Product"}
                      </p>
                      <p className={`${colors.textLight} text-xs mt-1 font-cormorant`}>
                        {item.variant?.color && item.variant.color}
                        {item.variant?.length && ` · ${item.variant.length}"`}
                        {item.variant?.laceType && ` · ${item.variant.laceType}`}
                      </p>
                      <p className={`${colors.textLight} text-xs mt-0.5 font-cormorant`}>Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-playfair text-black font-medium">{formatPrice(item.price)}</p>
                      <p className={`${colors.textLight} text-xs mt-0.5 font-cormorant`}>each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div className={`${colors.bgCard} border ${colors.border} p-5 rounded-sm`}>
                <h2 className="font-playfair text-lg text-black font-semibold mb-3">Shipping Address</h2>
                <div className="text-sm leading-relaxed font-cormorant">
                  <p className={`${colors.text} font-medium`}>{order.address.fullName}</p>
                  <p className={colors.textLight}>{order.address.street}</p>
                  <p className={colors.textLight}>{order.address.city}, {order.address.province} {order.address.postalCode}</p>
                  <p className={colors.textLight}>{order.address.country}</p>
                  <p className={`${colors.textLight} mt-1`}>{order.address.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className={`${colors.bgCard} border ${colors.border} p-5 sticky top-24 rounded-sm`}>
              <h2 className="font-playfair text-lg text-black font-semibold mb-4">Summary</h2>
              <div className={`space-y-3 text-sm mb-4 pb-4 border-b ${colors.borderLight}`}>
                <div className="flex justify-between">
                  <span className={colors.textLight}>Subtotal</span>
                  <span className={colors.text}>{formatPrice(order.total - shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={colors.textLight}>Shipping</span>
                  <span className={shipping === 0 ? colors.statusDelivered.split(' ')[1] : colors.text}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mb-5">
                <span className={`${colors.text} font-medium font-cormorant`}>Total</span>
                <span className="font-playfair text-xl text-black font-semibold">{formatPrice(order.total)}</span>
              </div>
              {order.payment && (
                <div className={`pt-4 border-t ${colors.borderLight}`}>
                  <p className={`${colors.textLight} text-xs tracking-widest uppercase mb-2 font-cormorant`}>Payment</p>
                  <div className="flex justify-between items-center">
                    <span className={`${colors.text} text-sm capitalize font-cormorant`}>{order.payment.provider}</span>
                    <span className={`text-xs px-2 py-0.5 border font-cormorant rounded-sm ${
                      order.payment.status === "SUCCESS" ? colors.statusDelivered :
                      order.payment.status === "PENDING" ? colors.statusPending :
                      colors.statusCancelled
                    }`}>
                      {order.payment.status}
                    </span>
                  </div>
                </div>
              )}
              {order.status === "PENDING" && order.payment?.status === "PENDING" && (
                <div className={`mt-4 pt-4 border-t ${colors.borderLight}`}>
                  <Link 
                    href="/checkout"
                    className={`block w-full text-center ${colors.buttonPrimary} py-2.5 text-xs font-medium tracking-widest uppercase transition-colors font-cormorant rounded-sm`}
                  >
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