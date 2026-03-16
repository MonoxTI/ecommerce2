"use client";
// app/account/orders/page.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-white/[0.06]">
          <p className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase mb-1">My Account</p>
          <h1 className="font-serif text-4xl text-[#F5F0E8] font-light">Order History</h1>
        </div>

        {/* Account nav */}
        <div className="flex gap-6 mb-8 text-xs tracking-widest uppercase border-b border-white/[0.06] pb-4">
          {[["Orders", "/account/orders"], ["Profile", "/account/profile"]].map(([label, href]) => (
            <Link key={label} href={href}
              className={`pb-4 -mb-4 border-b-2 transition-colors ${href === "/account/orders" ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-[#6B6B6B] hover:text-[#F5F0E8]"}`}>
              {label}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#111111] animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B6B6B] mb-6">No orders yet</p>
            <Link href="/shop" className="bg-[#C9A84C] text-[#0A0A0A] px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#E2C97E] transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}
                className="block bg-[#111111] border border-white/[0.06] p-5 hover:border-[#C9A84C]/30 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[#F5F0E8] text-sm font-medium font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 border ${STATUS_STYLES[order.status] ?? "bg-white/5 text-[#6B6B6B] border-white/10"}`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="text-[#6B6B6B] text-xs mb-2">
                      {new Date(order.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                    </p>

                    {order.trackingNumber && (
                      <p className="text-[#C9A84C] text-xs">Tracking: {order.trackingNumber}</p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-serif text-xl text-[#C9A84C]">{formatPrice(order.total)}</p>
                    <p className="text-[#6B6B6B] text-xs mt-1 group-hover:text-[#C9A84C] transition-colors">View →</p>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm border transition-colors ${p === page ? "border-[#C9A84C] text-[#C9A84C]" : "border-white/[0.06] text-[#6B6B6B] hover:border-white/20"}`}>
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