// lib/api.ts
const BASE = "";

async function request<T>(path: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
      // The httpOnly ws_access cookie is sent automatically on every
      // same-origin request because of this. Nothing in this file needs
      // to read, store, or manually attach a token anymore.
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error ?? json.message ?? "Something went wrong" };
    return { data: json.data ?? json, error: null };
  } catch {
    return { data: null, error: "Network error — please check your connection" };
  }
}

export const authApi = {
  register: (b: { name: string; email: string; password: string; phone: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) =>
    // accessToken removed from the response type — the server no longer
    // sends it in the body (it's set as an httpOnly cookie instead).
    request<{ user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(b) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request<User>("/api/auth/me"),
  refresh: () => request("/api/auth/refresh", { method: "POST" }),
  changePassword: (b: { currentPassword: string; newPassword: string }) =>
    request("/api/auth/change-password", { method: "POST", body: JSON.stringify(b) }),
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
  get: () => request<Cart>("/api/cart"),
  add: (b: { variantId: string; quantity: number }) =>
    request<Cart>("/api/cart", { method: "POST", body: JSON.stringify(b) }),
  update: (itemId: string, quantity: number) =>
    request<Cart>(`/api/cart/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),
  remove: (itemId: string) =>
    request<Cart>(`/api/cart/${itemId}`, { method: "DELETE" }),
  clear: () => request<Cart>("/api/cart", { method: "DELETE" }),
};

export const ordersApi = {
  list: (page = 1) =>
    request<{ items: Order[]; meta: PaginationMeta }>(`/api/orders?page=${page}`),
  get: (id: string) => request<Order>(`/api/orders/${id}`),
  checkout: (b: { addressId: string; couponCode?: string }) =>
    request<{ orderId: string; total: number; totalRands: number; shippingCost: number; discountAmount: number }>(
      "/api/orders", { method: "POST", body: JSON.stringify(b) }),
  cancel: (id: string) =>
    request(`/api/orders/${id}/cancel`, { method: "PATCH" }),
};

export const paymentsApi = {
  // PayFast (legacy)
  initiate: (orderId: string) =>
    request<{ fields: Record<string, string>; actionUrl: string }>(
      "/api/payments/initiate", { method: "POST", body: JSON.stringify({ orderId }) }),

  // Paystack
  initiatePaystack: (orderId: string) =>
    request<{ authorizationUrl: string; reference: string }>(
      "/api/payments/initiate-paystack", { method: "POST", body: JSON.stringify({ orderId }) }),
  verifyPaystack: (reference: string) =>
    request<{ status: string; orderId?: string }>(
      "/api/payments/verify-paystack", { method: "POST", body: JSON.stringify({ reference }) }),
};

export const addressesApi = {
  list: () => request<Address[]>("/api/addresses"),
  create: (b: any) =>
    request<Address>("/api/addresses", { method: "POST", body: JSON.stringify(b) }),
};

export const couponsApi = {
  validate: (code: string, orderTotal: number) =>
    request<{ code: string; discountAmount: number; discountRands: number; discountDisplay: string }>(
      "/api/coupons/validate", { method: "POST", body: JSON.stringify({ code, orderTotal }) }),
};

export const adminApi = {
  stats: () => request<AdminStats>("/api/admin/stats"),
  revenueChart: () =>
    request<{ date: string; amount: number }[]>("/api/admin/stats/revenue"),
  orders: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: Order[]; meta: PaginationMeta }>(`/api/admin/orders${qs}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    request(`/api/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  addTracking: (id: string, b: { trackingNumber: string; trackingUrl?: string }) =>
    request(`/api/admin/orders/${id}/tracking`, { method: "PATCH", body: JSON.stringify(b) }),
  customers: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: Customer[]; meta: PaginationMeta }>(`/api/admin/customers${qs}`);
  },
  toggleCustomer: (id: string, isActive: boolean) =>
    request(`/api/admin/customers/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  inventory: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: InventoryItem[]; summary: InventorySummary }>(`/api/admin/inventory${qs}`);
  },
  coupons: () =>
    request<{ items: Coupon[] }>("/api/admin/coupons"),
  createCoupon: (b: any) =>
    request<Coupon>("/api/admin/coupons", { method: "POST", body: JSON.stringify(b) }),
  deleteCoupon: (id: string) =>
    request(`/api/admin/coupons/${id}`, { method: "DELETE" }),
  reviews: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ items: Review[]; meta: PaginationMeta }>(`/api/admin/reviews${qs}`);
  },
  moderateReview: (id: string, action: "approve" | "reject") =>
    request(`/api/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ action }) }),
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