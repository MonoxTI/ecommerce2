// types/index.ts
// Shared TypeScript types used across the app.

import { Role, OrderStatus, PaymentStatus } from "@prisma/client";

// ─── JWT ─────────────────────────────────────────────────────

export interface JWTPayload {
  sub:   string; // userId
  email: string;
  role:  Role;
  iat:   number;
  exp:   number;
}

export interface TokenPair {
  accessToken:  string;
  refreshToken: string;
}

// ─── API RESPONSES ───────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data:    T;
  message?: string;
}

export interface ApiError {
  success: false;
  error:   string;
  code?:   string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta:  PaginationMeta;
}

// ─── PRODUCT ─────────────────────────────────────────────────

export interface VariantOptions {
  color?:    string;
  length?:   string;
  capSize?:  string;
  hairType?: string;
  texture?:  string;
}

// ─── CART ────────────────────────────────────────────────────

export interface CartItemDetail {
  id:        string;
  productId: string;
  variantId: string;
  quantity:  number;
  product: {
    name:         string;
    slug:         string;
    primaryImage: string | null;
  };
  variant: {
    name:    string;
    options: VariantOptions;
    price:   number;
    stock:   number;
  };
  lineTotal: number;
}

export interface CartSummary {
  items:     CartItemDetail[];
  subtotal:  number;
  itemCount: number;
}

// ─── ORDER ───────────────────────────────────────────────────

export interface CheckoutPayload {
  addressId:  string;
  couponCode?: string;
  notes?:     string;
}

export interface OrderSummary {
  orderId:     string;
  orderNumber: string;
  status:      OrderStatus;
  total:       number;
  itemCount:   number;
  createdAt:   Date;
}

// ─── PAYFAST ─────────────────────────────────────────────────

export interface PayFastITNPayload {
  m_payment_id:      string;
  pf_payment_id:     string;
  payment_status:    "COMPLETE" | "FAILED" | "CANCELLED";
  item_name:         string;
  item_description?: string;
  amount_gross:      string;
  amount_fee:        string;
  amount_net:        string;
  custom_str1?:      string;
  name_first?:       string;
  name_last?:        string;
  email_address?:    string;
  merchant_id:       string;
  signature:         string;
}