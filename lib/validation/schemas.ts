// lib/validation/schemas.ts

import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

// ─── AUTH ────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters").max(100),
  email:    z.string().email("Invalid email address"),
  password: passwordRule,
  phone:    z.string().min(10, "Enter a valid phone number").max(20),
});

export const LoginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  token:    z.string().min(1, "Token is required"),
  password: passwordRule,
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword:     passwordRule,
});

// ─── ADDRESS ─────────────────────────────────────────────────

export const AddressSchema = z.object({
  fullName:    z.string().min(2).max(100),
  phone:       z.string().min(10).max(20),
  street:      z.string().min(5).max(200),
  city:        z.string().min(2).max(100),
  province:    z.string().min(2).max(100),
  postalCode:  z.string().min(4).max(10),
  country:     z.string().min(2).max(100),
});

// ─── PRODUCT ─────────────────────────────────────────────────

export const ProductVariantSchema = z.object({
  sku:      z.string().min(3).max(50),
  price:    z.number().int().positive("Price must be a positive number in cents"),
  stock:    z.number().int().min(0),
  length:   z.string().optional(),
  color:    z.string().optional(),
  density:  z.string().optional(),
  laceType: z.string().optional(),
  capSize:  z.string().optional(),
});

export const ProductSchema = z.object({
  categoryId:  z.string().uuid(),
  name:        z.string().min(3).max(200),
  slug:        z.string().regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),
  description: z.string().min(10),
  brand:       z.string().optional(),
  variants:    z.array(ProductVariantSchema).min(1, "At least one variant required"),
  isActive:    z.boolean().optional(),
});

export const ProductQuerySchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().min(1).max(50).default(20),
  category:  z.string().optional(),
  search:    z.string().max(100).optional(),
  minPrice:  z.coerce.number().int().optional(),  // in cents
  maxPrice:  z.coerce.number().int().optional(),  // in cents
  color:     z.string().optional(),
  length:    z.string().optional(),
  laceType:  z.string().optional(),
  sortBy:    z.enum(["price_asc", "price_desc", "newest"]).optional(),
});

// ─── CART ────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity:  z.number().int().min(1).max(20),
});

export const UpdateCartSchema = z.object({
  quantity: z.number().int().min(0).max(20), // 0 = remove
});

// ─── CHECKOUT ────────────────────────────────────────────────

export const CheckoutSchema = z.object({
  addressId:  z.string().uuid(),
  couponCode: z.string().max(50).optional(),
  notes:      z.string().max(500).optional(),
});

// ─── REVIEW ──────────────────────────────────────────────────

export const ReviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

// ─── COUPON ──────────────────────────────────────────────────

export const CouponSchema = z.object({
  code:         z.string().min(3).max(30).toUpperCase(),
  discount:     z.number().int().positive(),
  type:         z.enum(["FIXED", "PERCENTAGE"]),
  active:       z.boolean().default(true),
  minOrder:     z.number().int().positive().optional(),
  maxUses:      z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  expiresAt:    z.string().datetime().optional(),
});

// ─── ADMIN ───────────────────────────────────────────────────

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const AddTrackingSchema = z.object({
  trackingNumber: z.string().min(3).max(100),
  trackingUrl:    z.string().url().optional(),
});