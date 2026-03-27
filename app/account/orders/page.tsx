// app/account/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  buttonDisabled: "opacity-40 cursor-not-allowed",
  
  // Accessible status badge colors (light bg + dark text)
  statusPending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  statusPaid: "bg-blue-50 text-blue-800 border-blue-200",
  statusShipped: "bg-purple-50 text-purple-800 border-purple-200",
  statusDelivered: "bg-green-50 text-green-800 border-green-200",
  statusCancelled: "bg-red-50 text-red-800 border-red-200",
  statusDefault: "bg-[#F1F1F1] text-[#666666] border-black/10",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   colors.statusPending,
  PAID:      colors.statusPaid,
  SHIPPED:   colors.statusShipped,
  DELIVERED: colors.statusDelivered,
  CANCELLED: colors.statusCancelled,
};

export default function AccountOrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    ordersApi.list(token, page).then(({ data }) => {
      if (data) { setOrders(data.items); setTotalPages(data.meta.totalPages); }
      setLoading(false);
    });
  }, [token, page]);

  return (
    <div className={`min-h-screen ${colors.bg} pt-24 pb-16 font-cormorant`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className={`mb-8 pb-6 border-b ${colors.border}`}>
          <p className={`${colors.text} text-xs tracking-[0.2em] uppercase mb-1 font-cormorant font-medium`}>My Account</p>
          <h1 className="font-playfair text-4xl text-black font-semibold">Order History</h1>
        </div>

        {/* Account nav */}
        <div className={`flex gap-6 mb-8 text-xs tracking-widest uppercase border-b ${colors.border} pb-4`}>
          {[["Orders", "/account/orders"], ["Profile", "/account/profile"]].map(([label, href]) => (
            <Link 
              key={label} 
              href={href}
              className={`pb-4 -mb-4 border-b-2 transition-colors font-cormorant ${
                href === "/account/orders"
                  ? "border-black text-black font-medium"
                  : `border-transparent ${colors.textLight} hover:${colors.text}`
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-24 ${colors.bgCard} border ${colors.border} animate-pulse rounded-sm`} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className={`${colors.textLight} mb-6 font-cormorant`}>No orders yet</p>
            <Link 
              href="/shop" 
              className={`${colors.buttonPrimary} px-8 py-3 text-xs tracking-widest uppercase font-medium transition-colors font-cormorant rounded-sm`}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link 
                key={order.id} 
                href={`/account/orders/${order.id}`}
                className={`block ${colors.bgCard} border ${colors.border} p-5 ${colors.borderHover} transition-colors group rounded-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`${colors.text} text-sm font-medium font-mono`}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 border font-cormorant rounded-sm ${
                        STATUS_STYLES[order.status] ?? colors.statusDefault
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <p className={`${colors.textLight} text-xs mb-2 font-cormorant`}>
                      {new Date(order.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                    </p>

                    {order.trackingNumber && (
                      <p className={`${colors.text} text-xs font-cormorant`}>
                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-playfair text-xl text-black font-semibold">{formatPrice(order.total)}</p>
                    <p className={`${colors.textLight} text-xs mt-1 group-hover:${colors.text} transition-colors font-cormorant`}>
                      View →
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm border transition-colors font-cormorant rounded-sm ${
                      p === page 
                        ? "border-black text-black font-medium" 
                        : `${colors.border} ${colors.textLight} ${colors.borderHover} hover:${colors.text}`
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}