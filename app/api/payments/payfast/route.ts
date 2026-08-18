// app/api/payments/payfast/route.ts
// POST /api/payments/payfast — creates order and returns PayFast form fields
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, badRequest, unauthorized, notFound } from "@/lib/api/response";
import { buildPayFastData } from "@/lib/payments/payfast";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.orderId) return badRequest("orderId is required");

  const order = await db.order.findFirst({
    where:   { id: body.orderId, userId: user.sub },
    include: {
      payment: true,
      user:    { select: { name: true, email: true } },
      items:   { include: { variant: { include: { product: { select: { name: true } } } } }, take: 1 },
    },
  });

  if (!order)                              return notFound("Order not found");
  if (order.payment?.status === "SUCCESS") return badRequest("This order has already been paid");
  if (order.status === "CANCELLED")        return badRequest("This order has been cancelled");

  const nameParts = (order.user.name ?? "Customer").split(" ");
  const firstName = nameParts[0];
  const lastName  = nameParts.slice(1).join(" ") || firstName;
  const itemName  = order.items[0]?.variant?.product?.name
    ? `novaa — ${order.items[0].variant.product.name}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`
    : "novaa Hair Products";

  const { actionUrl, fields } = buildPayFastData({
    orderId:     order.id,
    amountCents: Number(order.total),
    email:       order.user.email,
    firstName,
    lastName,
    itemName,
  });

  // Store pending payment
  await db.payment.upsert({
    where:  { orderId: order.id },
    update: { transactionId: order.id, provider: "payfast" },
    create: {
      orderId:       order.id,
      provider:      "payfast",
      transactionId: order.id,
      status:        "PENDING",
      amount:        order.total,
    },
  });

  return ok({ actionUrl, fields });
}