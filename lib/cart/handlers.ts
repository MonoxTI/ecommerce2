// lib/cart/handlers.ts
// All cart-related API logic.
//
// Your schema uses a Cart model (one per user) with CartItems linked to variants.
// Cart is created automatically on first add if it doesn't exist.
// Prices are in CENTS to match your ProductVariant.price field.

import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import {
  ok,
  badRequest,
  unauthorized,
  notFound,
  validationError,
} from "@/lib/api/response";
import { AddToCartSchema, UpdateCartSchema } from "@/lib/validation/schemas";

// ─── HELPERS ─────────────────────────────────────────────────

// Fetches full cart with computed totals
async function getCartWithTotals(userId: string) {
  const cart = await db.cart.findUnique({
    where:   { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id:   true,
                  name: true,
                  slug: true,
                  images: {
                    select: { url: true },
                    take:   1,
                  },
                },
              },
            },
          },
        },
        orderBy: { id: "asc" }, // stable order
      },
    },
  });

  if (!cart) {
    return {
      id:        null,
      items:     [],
      itemCount: 0,
      subtotal:  0, // in cents
    };
  }

  const items = cart.items.map((item) => ({
    id:        item.id,
    quantity:  item.quantity,
    variantId: item.variantId,
    variant: {
      id:       item.variant.id,
      sku:      item.variant.sku,
      price:    item.variant.price,      // cents
      stock:    item.variant.stock,
      color:    item.variant.color,
      length:   item.variant.length,
      density:  item.variant.density,
      laceType: item.variant.laceType,
      capSize:  item.variant.capSize,
    },
    product: {
      id:    item.variant.product.id,
      name:  item.variant.product.name,
      slug:  item.variant.product.slug,
      image: item.variant.product.images[0]?.url ?? null,
    },
    lineTotal: item.variant.price * item.quantity, // cents
  }));

  const subtotal  = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    id:        cart.id,
    items,
    itemCount,
    subtotal,   // in cents — divide by 100 on the frontend for display
  };
}

// ─── GET CART ────────────────────────────────────────────────
// GET /api/cart
// Returns current user's cart with line totals and subtotal.

export async function handleGetCart(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const cart = await getCartWithTotals(user.sub);
  return ok(cart);
}

// ─── ADD TO CART ─────────────────────────────────────────────
// POST /api/cart
// Body: { variantId, quantity }
// If variant already in cart → increments quantity.
// If new → creates CartItem (and Cart if this is the user's first item).

export async function handleAddToCart(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = AddToCartSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { variantId, quantity } = parsed.data;

  // Verify variant exists and has enough stock
  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
  });
  if (!variant) return notFound("Product variant not found");

  // Get or create the user's cart
  let cart = await db.cart.findUnique({ where: { userId: user.sub } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: user.sub } });
  }

  // Check if this variant is already in the cart
  const existingItem = await db.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  const newQuantity = (existingItem?.quantity ?? 0) + quantity;

  // Validate stock
  if (newQuantity > variant.stock) {
    return badRequest(
      variant.stock === 0
        ? "This item is out of stock"
        : `Only ${variant.stock} unit${variant.stock === 1 ? "" : "s"} available`
    );
  }

  if (existingItem) {
    // Update existing cart item
    await db.cartItem.update({
      where: { id: existingItem.id },
      data:  { quantity: newQuantity },
    });
  } else {
    // Create new cart item
    await db.cartItem.create({
      data: { cartId: cart.id, variantId, quantity },
    });
  }

  // Return updated cart
  const updatedCart = await getCartWithTotals(user.sub);
  return ok(updatedCart, "Item added to cart");
}

// ─── UPDATE CART ITEM ────────────────────────────────────────
// PATCH /api/cart/[itemId]
// Body: { quantity }   →  quantity 0 = remove the item

export async function handleUpdateCartItem(
  req: NextRequest,
  itemId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = UpdateCartSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { quantity } = parsed.data;

  // Verify the item belongs to this user
  const item = await db.cartItem.findFirst({
    where: {
      id:   itemId,
      cart: { userId: user.sub },
    },
    include: { variant: true },
  });
  if (!item) return notFound("Cart item not found");

  // quantity 0 = remove
  if (quantity === 0) {
    await db.cartItem.delete({ where: { id: itemId } });
    const updatedCart = await getCartWithTotals(user.sub);
    return ok(updatedCart, "Item removed from cart");
  }

  // Validate stock
  if (quantity > item.variant.stock) {
    return badRequest(
      `Only ${item.variant.stock} unit${item.variant.stock === 1 ? "" : "s"} available`
    );
  }

  await db.cartItem.update({
    where: { id: itemId },
    data:  { quantity },
  });

  const updatedCart = await getCartWithTotals(user.sub);
  return ok(updatedCart, "Cart updated");
}

// ─── REMOVE CART ITEM ────────────────────────────────────────
// DELETE /api/cart/[itemId]

export async function handleRemoveCartItem(
  req: NextRequest,
  itemId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  // Verify item belongs to this user
  const item = await db.cartItem.findFirst({
    where: {
      id:   itemId,
      cart: { userId: user.sub },
    },
  });
  if (!item) return notFound("Cart item not found");

  await db.cartItem.delete({ where: { id: itemId } });

  const updatedCart = await getCartWithTotals(user.sub);
  return ok(updatedCart, "Item removed from cart");
}

// ─── CLEAR CART ──────────────────────────────────────────────
// DELETE /api/cart
// Removes all items but keeps the Cart record.

export async function handleClearCart(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const cart = await db.cart.findUnique({ where: { userId: user.sub } });
  if (!cart) return ok({ items: [], itemCount: 0, subtotal: 0 }, "Cart is already empty");

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });

  return ok({ id: cart.id, items: [], itemCount: 0, subtotal: 0 }, "Cart cleared");
}