// lib/products/handlers.ts
// All product-related API logic.
// Prices are stored in CENTS (integers) — divide by 100 for display.

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  paginate,
} from "@/lib/api/response";
import {
  ProductSchema,
  ProductQuerySchema,
  ProductVariantSchema,
} from "@/lib/validation/schemas";
import { Role } from "@prisma/client";
import { z } from "zod";

// ─── HELPERS ─────────────────────────────────────────────────

function isAdmin(role: Role) {
  return role === Role.ADMIN;
}

// Formats a product for API response — converts cents to readable format
// and computes useful derived fields (avgRating, minPrice, inStock)
function formatProduct(product: any) {
  const variants = product.variants ?? [];

  const avgRating =
    product.reviews?.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        product.reviews.length
      : null;

  const minPrice = variants.length > 0
    ? Math.min(...variants.map((v: any) => v.price))
    : null;

  const maxPrice = variants.length > 0
    ? Math.max(...variants.map((v: any) => v.price))
    : null;

  const totalStock = variants.reduce(
    (sum: number, v: any) => sum + v.stock,
    0
  );

  return {
    ...product,
    avgRating:   avgRating ? Math.round(avgRating * 10) / 10 : null,
    reviewCount: product.reviews?.length ?? 0,
    minPrice,   // in cents
    maxPrice,   // in cents
    inStock:    totalStock > 0,
    totalStock,
    reviews: undefined, // don't expose full reviews in list view
  };
}

// ─── LIST PRODUCTS ───────────────────────────────────────────
// GET /api/products
// Public. Supports filtering, searching, sorting, pagination.

export async function handleGetProducts(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = ProductQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );
  if (!query.success) return validationError(query.error);

  const {
    page, limit, category, search,
    minPrice, maxPrice, color, length,
    laceType, sortBy,
  } = query.data;

  // Build dynamic WHERE clause
  const where: any = { isActive: true }; // never show hidden products in public shop

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name:        { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand:       { contains: search, mode: "insensitive" } },
    ];
  }

  // Variant-level filters — only return products that have
  // at least one matching variant
  const variantFilter: any = {};
  if (minPrice !== undefined) variantFilter.price = { ...variantFilter.price, gte: minPrice };
  if (maxPrice !== undefined) variantFilter.price = { ...variantFilter.price, lte: maxPrice };
  if (color)    variantFilter.color    = { contains: color,    mode: "insensitive" };
  if (length)   variantFilter.length   = length;
  if (laceType) variantFilter.laceType = { contains: laceType, mode: "insensitive" };

  if (Object.keys(variantFilter).length > 0) {
    where.variants = { some: variantFilter };
  }

  // Sort
  const orderBy: any =
    sortBy === "price_asc"  ? { variants: { _min: { price: "asc"  } } } :
    sortBy === "price_desc" ? { variants: { _min: { price: "desc" } } } :
    { createdAt: "desc" }; // newest (default)

  // Run as two separate queries — Neon serverless doesn't support interactive transactions
  const total    = await db.product.count({ where });
  const products = await db.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images:   { select: { id: true, url: true }, take: 1 },
      variants: {
        select: {
          id:       true,
          sku:      true,
          price:    true,
          stock:    true,
          color:    true,
          length:   true,
          density:  true,
          laceType: true,
          capSize:  true,
        },
      },
      reviews: { select: { rating: true } },
    },
  });

  return ok({
    items: products.map(formatProduct),
    meta:  paginate(total, page, limit),
  });
}

// ─── GET SINGLE PRODUCT ──────────────────────────────────────
// GET /api/products/[slug]
// Public. Returns full product with all variants, images, and reviews.

export async function handleGetProduct(
  _req: NextRequest,
  slug: string
) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images:   { select: { id: true, url: true } },
      variants: {
        orderBy: { price: "asc" },
        select: {
          id:       true,
          sku:      true,
          price:    true,
          stock:    true,
          color:    true,
          length:   true,
          density:  true,
          laceType: true,
          capSize:  true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take:    20,
        select: {
          id:        true,
          rating:    true,
          comment:   true,
          verified:  true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!product) return notFound("Product not found");

  return ok(formatProduct(product));
}

// ─── CREATE PRODUCT (ADMIN) ──────────────────────────────────
// POST /api/admin/products

export async function handleCreateProduct(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { variants, ...productData } = parsed.data;

  if (!variants || variants.length === 0) {
    return badRequest("At least one variant is required");
  }

  // Check slug is unique
  const existing = await db.product.findUnique({
    where: { slug: productData.slug },
  });
  if (existing) return conflict("A product with this slug already exists");

  // Validate category exists
  const category = await db.category.findUnique({
    where: { id: productData.categoryId },
  });
  if (!category) return badRequest("Category not found");

  // Check all SKUs are unique
  const skus = variants.map((v) => v.sku);
  const existingVariants = await db.productVariant.findMany({
    where: { sku: { in: skus } },
    select: { sku: true },
  });
  if (existingVariants.length > 0) {
    return conflict(
      `SKU(s) already in use: ${existingVariants.map((v) => v.sku).join(", ")}`
    );
  }

  const product = await db.product.create({
    data: {
      ...productData,
      variants: { create: variants },
    },
    include: {
      category: { select: { name: true, slug: true } },
      variants: true,
      images:   true,
    },
  });

  return created(product, "Product created successfully");
}

// ─── UPDATE PRODUCT (ADMIN) ──────────────────────────────────
// PATCH /api/admin/products/[id]

export async function handleUpdateProduct(
  req: NextRequest,
  id: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  // Partial update — all fields optional
  const parsed = ProductSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return notFound("Product not found");

  // If slug is being changed, check it's not taken
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const slugTaken = await db.product.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (slugTaken) return conflict("This slug is already in use");
  }

  const { variants, ...productData } = parsed.data;

  const product = await db.product.update({
    where: { id },
    data:  productData,
    include: {
      category: { select: { name: true, slug: true } },
      variants: true,
      images:   true,
    },
  });

  return ok(product, "Product updated successfully");
}

// ─── DELETE PRODUCT (ADMIN) ──────────────────────────────────
// DELETE /api/admin/products/[id]
// Soft-delete by checking if it has orders, hard delete if not.

export async function handleDeleteProduct(
  req: NextRequest,
  id: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const product = await db.product.findUnique({
    where:   { id },
    include: { variants: { include: { orderItems: { take: 1 } } } },
  });
  if (!product) return notFound("Product not found");

  // Check if any variant has been ordered
  const hasOrders = product.variants.some((v) => v.orderItems.length > 0);

  if (hasOrders) {
    // Can't hard delete — would break order history. Refuse and let admin use PATCH isActive:false instead.
    return badRequest(
      "This product has existing orders and cannot be permanently deleted. Use the Hide option to remove it from the shop."
    );
  }

  // Safe to hard delete — no orders reference this product
  await db.product.delete({ where: { id } });
  return ok(null, "Product deleted successfully");
}

// ─── ADD VARIANT (ADMIN) ─────────────────────────────────────
// POST /api/admin/products/[id]/variants

export async function handleAddVariant(
  req: NextRequest,
  productId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = ProductVariantSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return notFound("Product not found");

  const skuExists = await db.productVariant.findUnique({
    where: { sku: parsed.data.sku },
  });
  if (skuExists) return conflict("This SKU is already in use");

  const variant = await db.productVariant.create({
    data: { ...parsed.data, productId },
  });

  return created(variant, "Variant added successfully");
}

// ─── UPDATE VARIANT (ADMIN) ──────────────────────────────────
// PATCH /api/admin/products/[id]/variants/[variantId]

export async function handleUpdateVariant(
  req: NextRequest,
  productId: string,
  variantId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = ProductVariantSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const variant = await db.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!variant) return notFound("Variant not found");

  const updated = await db.productVariant.update({
    where: { id: variantId },
    data:  parsed.data,
  });

  return ok(updated, "Variant updated");
}
// ─── DELETE VARIANT (ADMIN) ──────────────────────────────────
// DELETE /api/admin/products/[id]/variants/[variantId]

export async function handleDeleteVariant(
  req: NextRequest,
  productId: string,
  variantId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const variant = await db.productVariant.findFirst({
    where:   { id: variantId, productId },
    include: { orderItems: { take: 1 } },
  });
  if (!variant) return notFound("Variant not found");

  // If variant has been ordered — set stock to 0 instead of deleting
  if (variant.orderItems.length > 0) {
    await db.productVariant.update({
      where: { id: variantId },
      data:  { stock: 0 },
    });
    return ok(null, "Variant has existing orders — stock set to 0.");
  }

  await db.productVariant.delete({ where: { id: variantId } });
  return ok(null, "Variant deleted");
}



// ─── UPDATE STOCK (ADMIN) ────────────────────────────────────
// PATCH /api/admin/products/[id]/variants/[variantId]/stock

export async function handleUpdateStock(
  req: NextRequest,
  productId: string,
  variantId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  const { stock } = z.object({
    stock: z.number().int().min(0, "Stock cannot be negative"),
  }).parse(body);

  const variant = await db.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!variant) return notFound("Variant not found");

  const updated = await db.productVariant.update({
    where: { id: variantId },
    data:  { stock },
  });

  return ok(updated, `Stock updated to ${stock}`);
}

// ─── ADD IMAGE (ADMIN) ───────────────────────────────────────
// POST /api/admin/products/[id]/images

export async function handleAddImage(
  req: NextRequest,
  productId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  const parsed = z.object({
    url: z.string().url("Must be a valid URL"),
  }).safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return notFound("Product not found");

  const image = await db.productImage.create({
    data: { productId, url: parsed.data.url },
  });

  return created(image, "Image added");
}

// ─── DELETE IMAGE (ADMIN) ────────────────────────────────────
// DELETE /api/admin/products/[id]/images/[imageId]

export async function handleDeleteImage(
  req: NextRequest,
  productId: string,
  imageId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const image = await db.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) return notFound("Image not found");

  await db.productImage.delete({ where: { id: imageId } });
  return ok(null, "Image deleted");
}

// ─── LIST CATEGORIES ─────────────────────────────────────────
// GET /api/categories

export async function handleGetCategories(_req: NextRequest) {
  const categories = await db.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return ok(categories);
}

// ─── CREATE CATEGORY (ADMIN) ─────────────────────────────────
// POST /api/categories

export async function handleCreateCategory(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  const parsed = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  }).safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const existing = await db.category.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) return conflict("A category with this slug already exists");

  const category = await db.category.create({ data: parsed.data });
  return created(category, "Category created");
}

// ─── UPDATE CATEGORY (ADMIN) ─────────────────────────────────
// PATCH /api/categories/[id]

export async function handleUpdateCategory(
  req: NextRequest,
  id: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  const parsed = z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  }).safeParse(body);

  if (!parsed.success) return validationError(parsed.error);

  const category = await db.category.findUnique({ where: { id } });
  if (!category) return notFound("Category not found");

  const updated = await db.category.update({
    where: { id },
    data:  parsed.data,
  });

  return ok(updated, "Category updated");
}