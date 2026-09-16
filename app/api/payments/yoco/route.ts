// app/api/payments/yoco/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, badRequest, unauthorized, notFound } from "@/lib/api/response";
import { createYocoCheckout } from "@/lib/payments/yoco";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.orderId) return badRequest("orderId is required");

  const order = await db.order.findFirst({
    where:   { id: body.orderId, userId: user.sub },
    include: { payment: true, user: { select: { name: true, email: true } } },
  });

  if (!order)                              return notFound("Order not found");
  if (order.payment?.status === "SUCCESS") return badRequest("Order already paid");
  if (order.status === "CANCELLED")        return badRequest("Order has been cancelled");

  const appUrl     = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = `${appUrl}/checkout/success?orderId=${order.id}`;
  const cancelUrl  = `${appUrl}/checkout/cancelled?orderId=${order.id}`;

  const { id: checkoutId, redirectUrl } = await createYocoCheckout({
    orderId:     order.id,
    amountCents: Number(order.total),
    successUrl,
    cancelUrl,
  });

  // Store pending payment
  await db.payment.upsert({
    where:  { orderId: order.id },
    update: { transactionId: checkoutId, provider: "yoco" },
    create: {
      orderId:       order.id,
      provider:      "yoco",
      transactionId: checkoutId,
      status:        "PENDING",
      amount:        order.total,
    },
  });

  return ok({ redirectUrl, checkoutId });
}