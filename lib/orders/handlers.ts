// lib/orders/handlers.ts
// All order-related API logic.
//
// Flow:
//   1. POST /api/orders          → creates order from cart, returns orderId
//   2. POST /api/payments/initiate → user pays via PayFast
//   3. PayFast ITN webhook        → updates order status to PAID
//
// Prices are in CENTS throughout (matching your schema).

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
  validationError,
  paginate,
} from "@/lib/api/response";
import { CheckoutSchema, UpdateOrderStatusSchema, AddTrackingSchema } from "@/lib/validation/schemas";
import { Role } from "@prisma/client";

// ─── HELPERS ─────────────────────────────────────────────────

function isAdmin(role: Role) {
  return role === Role.ADMIN;
}

// Formats order for API response
function formatOrder(order: any) {
  return {
    ...order,
    // Convert cents to rands for display convenience
    totalRands:    order.total / 100,
    items: order.items?.map((item: any) => ({
      ...item,
      priceRands:    item.price / 100,
      lineTotalRands: (item.price * item.quantity) / 100,
    })),
  };
}

// ─── CHECKOUT ────────────────────────────────────────────────
// POST /api/orders
// Creates an order from the user's current cart.
// Validates stock, applies coupon, calculates totals,
// decrements stock — all inside a DB transaction.

export async function handleCheckout(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { addressId, couponCode, notes } = parsed.data;

  // ── 1. Validate address belongs to user ──────────────────
  const address = await db.address.findFirst({
    where: { id: addressId, userId: user.sub },
  });
  if (!address) return notFound("Shipping address not found");

  // ── 2. Load cart ─────────────────────────────────────────
  const cart = await db.cart.findUnique({
    where:   { userId: user.sub },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return badRequest("Your cart is empty");
  }

  // ── 3. Validate stock for every item ─────────────────────
  for (const item of cart.items) {
    if (item.variant.stock < item.quantity) {
      return badRequest(
        item.variant.stock === 0
          ? `"${item.variant.product.name}" is out of stock`
          : `Only ${item.variant.stock} unit${item.variant.stock === 1 ? "" : "s"} of "${item.variant.product.name}" available`
      );
    }
  }

  // ── 4. Calculate subtotal ─────────────────────────────────
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  ); // in cents

  // ── 5. Apply coupon (if provided) ────────────────────────
  let discountAmount = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await db.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon)          return badRequest("Invalid coupon code");
    if (!coupon.active)   return badRequest("This coupon is no longer active");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return badRequest("This coupon has expired");
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return badRequest("This coupon has reached its usage limit");
    }
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return badRequest(
        `Minimum order of R${(coupon.minOrder / 100).toFixed(2)} required for this coupon`
      );
    }

    discountAmount =
      coupon.type === "PERCENTAGE"
        ? Math.round((subtotal * coupon.discount) / 100)
        : Math.min(coupon.discount, subtotal); // can't discount more than subtotal
  }

  // ── 6. Shipping cost ─────────────────────────────────────
  // Free shipping over R1,000 (100000 cents), else R99 (9900 cents)
  const afterDiscount = subtotal - discountAmount;
  const shippingCost  = afterDiscount >= 100_000 ? 0 : 9_900;

  // ── 7. Final total ───────────────────────────────────────
  const total = afterDiscount + shippingCost;

  // ── 8. Create everything in a transaction ────────────────
  const order = await db.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        userId:    user.sub,
        addressId: address.id,
        status:    "PENDING",
        total,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            quantity:  item.quantity,
            price:     item.variant.price, // snapshot price at time of order
          })),
        },
        payment: {
          create: {
            provider: "payfast",
            status:   "PENDING",
            amount:   total,
            currency: "ZAR",
          },
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, slug: true } },
              },
            },
          },
        },
        payment:  true,
        address:  true,
      },
    });

    // Decrement stock for each variant
    for (const item of cart.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data:  { stock: { decrement: item.quantity } },
      });
    }

    // Increment coupon usage count
    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data:  { usedCount: { increment: 1 } },
      });
    }

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return created(
    {
      orderId:        order.id,
      total,          // cents — pass this to PayFast initiate
      totalRands:     total / 100,
      discountAmount,
      shippingCost,
      itemCount:      cart.items.length,
    },
    "Order created. Proceed to payment."
  );
}

// ─── LIST MY ORDERS ──────────────────────────────────────────
// GET /api/orders
// Returns paginated order history for the logged-in user.

export async function handleGetMyOrders(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));

  const [total, orders] = await db.$transaction([
    db.order.count({ where: { userId: user.sub } }),
    db.order.findMany({
      where:   { userId: user.sub },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name:   true,
                    slug:   true,
                    images: { select: { url: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
        payment: { select: { status: true, provider: true } },
        address: {
          select: {
            fullName: true,
            city:     true,
            province: true,
          },
        },
      },
    }),
  ]);

  return ok({
    items: orders.map(formatOrder),
    meta:  paginate(total, page, limit),
  });
}

// ─── GET SINGLE ORDER ────────────────────────────────────────
// GET /api/orders/[id]
// Users can only see their own orders.

export async function handleGetOrder(
  req: NextRequest,
  orderId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const order = await db.order.findFirst({
    where: {
      id:     orderId,
      userId: user.sub, // ensures users can't access other people's orders
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  name:   true,
                  slug:   true,
                  images: { select: { url: true }, take: 1 },
                },
              },
            },
          },
        },
      },
      payment: true,
      address: true,
    },
  });

  if (!order) return notFound("Order not found");
  return ok(formatOrder(order));
}

// ─── CANCEL ORDER ────────────────────────────────────────────
// PATCH /api/orders/[id]/cancel
// Users can cancel their own PENDING orders before payment.

export async function handleCancelOrder(
  req: NextRequest,
  orderId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const order = await db.order.findFirst({
    where:   { id: orderId, userId: user.sub },
    include: { items: true },
  });

  if (!order) return notFound("Order not found");

  if (order.status !== "PENDING") {
    return badRequest(
      order.status === "PAID"
        ? "This order has already been paid. Please contact support to cancel."
        : `Cannot cancel an order with status "${order.status}"`
    );
  }

  // Restore stock + cancel order in a transaction
  await db.$transaction(async (tx) => {
    // Restore stock
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data:  { stock: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data:  { status: "CANCELLED" },
    });

    await tx.payment.updateMany({
      where: { orderId },
      data:  { status: "CANCELLED" },
    });
  });

  return ok(null, "Order cancelled successfully");
}

// ─── ADMIN: LIST ALL ORDERS ──────────────────────────────────
// GET /api/admin/orders
// Supports filtering by status, search by customer email.

export async function handleAdminGetOrders(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, Number(searchParams.get("page")   ?? 1));
  const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const status = searchParams.get("status");
  const search = searchParams.get("search"); // search by customer email

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.user = { email: { contains: search, mode: "insensitive" } };
  }

  const [total, orders] = await db.$transaction([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true } },
              },
            },
          },
        },
        payment: true,
        address: true,
      },
    }),
  ]);

  return ok({
    items: orders.map(formatOrder),
    meta:  paginate(total, page, limit),
  });
}

// ─── ADMIN: GET SINGLE ORDER ─────────────────────────────────
// GET /api/admin/orders/[id]

export async function handleAdminGetOrder(
  req: NextRequest,
  orderId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: {
      user:    { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  name:   true,
                  slug:   true,
                  images: { select: { url: true }, take: 1 },
                },
              },
            },
          },
        },
      },
      payment: true,
      address: true,
    },
  });

  if (!order) return notFound("Order not found");
  return ok(formatOrder(order));
}

// ─── ADMIN: UPDATE ORDER STATUS ──────────────────────────────
// PATCH /api/admin/orders/[id]/status
// Body: { status: "SHIPPED" }

export async function handleUpdateOrderStatus(
  req: NextRequest,
  orderId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = UpdateOrderStatusSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return notFound("Order not found");

  // Prevent nonsensical status transitions
  const invalidTransitions: Record<string, string[]> = {
    CANCELLED:  ["PENDING", "PAID", "SHIPPED", "DELIVERED"],
    DELIVERED:  ["PENDING", "PAID", "SHIPPED"],
  };

  if (invalidTransitions[order.status]?.includes(parsed.data.status)) {
    return badRequest(
      `Cannot change status from "${order.status}" to "${parsed.data.status}"`
    );
  }

  const updated = await db.order.update({
    where: { id: orderId },
    data:  { status: parsed.data.status },
  });

  // TODO: Send status update email to customer
  // await sendOrderStatusEmail(order.userId, updated.status)

  return ok(formatOrder(updated), `Order status updated to ${parsed.data.status}`);
}

// ─── ADMIN: ADD TRACKING INFO ────────────────────────────────
// PATCH /api/admin/orders/[id]/tracking
// Body: { trackingNumber, trackingUrl? }

export async function handleAddTracking(
  req: NextRequest,
  orderId: string
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = AddTrackingSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return notFound("Order not found");

  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      trackingNumber: parsed.data.trackingNumber,
      trackingUrl:    parsed.data.trackingUrl,
      status:         "SHIPPED",
      shippedAt:      new Date(),
    },
  });

  // TODO: Send shipping notification email with tracking link
  // await sendShippingEmail(order.userId, parsed.data)

  return ok(formatOrder(updated), "Tracking info added and order marked as shipped");
}

// ─── ADMIN: DASHBOARD STATS ──────────────────────────────────
// GET /api/admin/stats
// Quick overview of orders, revenue and pending actions.

export async function handleAdminStats(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin access required");

  const now          = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    ordersToday,
    ordersThisMonth,
    pendingOrders,
    paidOrders,
    shippedOrders,
    revenueTotal,
    revenueThisMonth,
    totalCustomers,
    lowStockVariants,
  ] = await db.$transaction([
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: startOfToday } } }),
    db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PAID" } }),
    db.order.count({ where: { status: "SHIPPED" } }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", createdAt: { gte: startOfMonth } },
    }),
    db.user.count({ where: { role: Role.CUSTOMER } }),
    db.productVariant.count({ where: { stock: { lte: 5 } } }),
  ]);

  return ok({
    orders: {
      total:      totalOrders,
      today:      ordersToday,
      thisMonth:  ordersThisMonth,
      pending:    pendingOrders,
      paid:       paidOrders,
      shipped:    shippedOrders,
    },
    revenue: {
      total:        (revenueTotal._sum.amount     ?? 0) / 100, // rands
      thisMonth:    (revenueThisMonth._sum.amount ?? 0) / 100,
    },
    customers:   totalCustomers,
    lowStock:    lowStockVariants, // variants with stock <= 5
  });
}