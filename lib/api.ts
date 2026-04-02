// lib/api.ts
const BASE = "";

async function request<T>(path: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error ?? json.message ?? "Something went wrong" };
    return { data: json.data ?? json, error: null };
  } catch {
    return { data: null, error: "Network error — please check your connection" };
  }
}

const h = (token: string) => ({ Authorization: `Bearer ${token}` });

export const authApi = {
  register: (b: { name: string; email: string; password: string; phone: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) =>
    request<{ user: User; accessToken: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(b) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: (token: string) => request<User>("/api/auth/me", { headers: h(token) }),
  refresh: () => request<{ accessToken: string }>("/api/auth/refresh", { method: "POST" }),
  changePassword: (b: { currentPassword: string; newPassword: string }, token: string) =>
    request("/api/auth/change-password", { method: "POST", body: JSON.stringify(b), headers: h(token) }),
};

export const productsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: Product[]; meta: PaginationMeta }>(`/api/products${qs}`);
  },
  get: (slug: string) => request<Product>(`/api/products/${slug}`),
  getCategories: () => request<Category[]>("/api/categories"),
};

export const cartApi = {
  get: (token: string) => request<Cart>("/api/cart", { headers: h(token) }),
  add: (b: { variantId: string; quantity: number }, token: string) =>
    request<Cart>("/api/cart", { method: "POST", body: JSON.stringify(b), headers: h(token) }),
  update: (itemId: string, quantity: number, token: string) =>
    request<Cart>(`/api/cart/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }), headers: h(token) }),
  remove: (itemId: string, token: string) =>
    request<Cart>(`/api/cart/${itemId}`, { method: "DELETE", headers: h(token) }),
  clear: (token: string) => request<Cart>("/api/cart", { method: "DELETE", headers: h(token) }),
};

export const ordersApi = {
  list: (token: string, page = 1) =>
    request<{ items: Order[]; meta: PaginationMeta }>(`/api/orders?page=${page}`, { headers: h(token) }),
  get: (id: string, token: string) => request<Order>(`/api/orders/${id}`, { headers: h(token) }),
  checkout: (b: { addressId: string; couponCode?: string }, token: string) =>
    request<{ orderId: string; total: number; totalRands: number; shippingCost: number; discountAmount: number }>(
      "/api/orders", { method: "POST", body: JSON.stringify(b), headers: h(token) }),
  cancel: (id: string, token: string) =>
    request(`/api/orders/${id}/cancel`, { method: "PATCH", headers: h(token) }),
};

export const paymentsApi = {
  // PayFast (legacy)
  initiate: (orderId: string, token: string) =>
    request<{ fields: Record<string, string>; actionUrl: string }>(
      "/api/payments/initiate", { method: "POST", body: JSON.stringify({ orderId }), headers: h(token) }),

  // Paystack
  initiatePaystack: (orderId: string, token: string) =>
    request<{ authorizationUrl: string; reference: string }>(
      "/api/payments/initiate-paystack", { method: "POST", body: JSON.stringify({ orderId }), headers: h(token) }),
  verifyPaystack: (reference: string) =>
    request<{ status: string; orderId?: string }>(
      "/api/payments/verify-paystack", { method: "POST", body: JSON.stringify({ reference }) }),
};

export const addressesApi = {
  list: (token: string) => request<Address[]>("/api/addresses", { headers: h(token) }),
  create: (b: any, token: string) =>
    request<Address>("/api/addresses", { method: "POST", body: JSON.stringify(b), headers: h(token) }),
};

export const couponsApi = {
  validate: (code: string, orderTotal: number) =>
    request<{ code: string; discountAmount: number; discountRands: number; discountDisplay: string }>(
      "/api/coupons/validate", { method: "POST", body: JSON.stringify({ code, orderTotal }) }),
};

export const adminApi = {
  stats: (token: string) => request<AdminStats>("/api/admin/stats", { headers: h(token) }),
  revenueChart: (token: string) =>
    request<{ date: string; amount: number }[]>("/api/admin/stats/revenue", { headers: h(token) }),
  orders: (token: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: Order[]; meta: PaginationMeta }>(`/api/admin/orders${qs}`, { headers: h(token) });
  },
  updateOrderStatus: (id: string, status: string, token: string) =>
    request(`/api/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }), headers: h(token) }),
  addTracking: (id: string, b: { trackingNumber: string; trackingUrl?: string }, token: string) =>
    request(`/api/admin/orders/${id}/tracking`, { method: "PATCH", body: JSON.stringify(b), headers: h(token) }),
  customers: (token: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: Customer[]; meta: PaginationMeta }>(`/api/admin/customers${qs}`, { headers: h(token) });
  },
  toggleCustomer: (id: string, isActive: boolean, token: string) =>
    request(`/api/admin/customers/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }), headers: h(token) }),
  inventory: (token: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: InventoryItem[]; summary: InventorySummary }>(`/api/admin/inventory${qs}`, { headers: h(token) });
  },
  coupons: (token: string) =>
    request<{ items: Coupon[] }>("/api/admin/coupons", { headers: h(token) }),
  createCoupon: (b: any, token: string) =>
    request<Coupon>("/api/admin/coupons", { method: "POST", body: JSON.stringify(b), headers: h(token) }),
  deleteCoupon: (id: string, token: string) =>
    request(`/api/admin/coupons/${id}`, { method: "DELETE", headers: h(token) }),
  reviews: (token: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: Review[]; meta: PaginationMeta }>(`/api/admin/reviews${qs}`, { headers: h(token) });
  },
  moderateReview: (id: string, action: "approve" | "reject", token: string) =>
    request(`/api/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ action }), headers: h(token) }),
};

// ─── TYPES ────────────────────────────────────────────────────
export interface User { id: string; name: string; email: string; phone: string; role: "CUSTOMER" | "ADMIN"; isActive: boolean; createdAt: string; _count?: { orders: number; reviews: number }; }
export interface Category { id: string; name: string; slug: string; _count?: { products: number }; }
export interface ProductVariant { id: string; sku: string; price: number; stock: number; color?: string; length?: string; density?: string; laceType?: string; capSize?: string; }
export interface Product { id: string; slug: string; name: string; description: string; brand?: string; category: Category; images: { id: string; url: string }[]; variants: ProductVariant[]; minPrice: number; maxPrice: number; avgRating: number | null; reviewCount: number; inStock: boolean; totalStock: number; reviews?: Review[]; }
export interface CartItem { id: string; quantity: number; variantId: string; lineTotal: number; variant: ProductVariant; product: { id: string; name: string; slug: string; image: string | null }; }
export interface Cart { id: string | null; items: CartItem[]; itemCount: number; subtotal: number; }
export interface Address { id: string; userId: string; fullName: string; phone: string; street: string; city: string; province: string; postalCode: string; country: string; createdAt: string; }
export interface OrderItem { id: string; quantity: number; price: number; priceRands: number; lineTotalRands: number; variant: ProductVariant & { product: { name: string; slug: string; images?: { url: string }[] } }; }
export interface Order { id: string; status: string; total: number; totalRands: number; createdAt: string; updatedAt: string; trackingNumber?: string; trackingUrl?: string; shippedAt?: string; items: OrderItem[]; payment?: { status: string; provider: string }; address: Address; user?: User; }
export interface Customer { id: string; name: string; email: string; phone: string; isActive: boolean; createdAt: string; _count: { orders: number; reviews: number }; }
export interface InventoryItem { id: string; sku: string; stock: number; price: number; priceRands: number; color?: string; length?: string; laceType?: string; stockStatus: "OUT_OF_STOCK" | "CRITICAL" | "LOW" | "OK"; product: { id: string; name: string; slug: string; images: { url: string }[] }; }
export interface InventorySummary { total: number; outOfStock: number; critical: number; low: number; }
export interface Coupon { id: string; code: string; discount: number; type: "FIXED" | "PERCENTAGE"; active: boolean; usedCount: number; maxUses?: number; expiresAt?: string; discountDisplay: string; isExpired: boolean; }
export interface Review { id: string; rating: number; comment?: string; verified: boolean; createdAt: string; user: { id: string; name: string; email: string }; product: { id: string; name: string; slug: string }; }
export interface PaginationMeta { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean; }
export interface AdminStats { orders: { total: number; today: number; thisMonth: number; pending: number; paid: number; shipped: number; growth: number | null }; revenue: { total: number; thisMonth: number; lastMonth: number; growth: number | null }; customers: { total: number; newThisMonth: number }; products: { total: number; outOfStock: number; lowStock: number }; alerts: { pendingOrders: number; outOfStock: number; lowStock: number; pendingReviews: number }; }