// app/api/payments/initiate/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { getCurrentUser } from "@/lib/auth/JWT";
import { ok, badRequest, unauthorized, notFound } from "@/lib/api/response";
import { initializePaystackTransaction } from "@/lib/payments/paystack";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.orderId) return badRequest("orderId is required");

  const order = await db.order.findFirst({
    where:   { id: body.orderId, userId: user.sub },
    include: { payment: true, user: { select: { email: true } } },
  });

  if (!order)                               return notFound("Order not found");
  if (order.payment?.status === "SUCCESS")  return badRequest("Order already paid");
  if (order.status === "CANCELLED")         return badRequest("Order is cancelled");

  // NEXT_PUBLIC_ vars are client-only — undefined in API routes. Use APP_URL instead.
  const appUrl      = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl}/checkout/success?orderId=${order.id}`;

  const { authorizationUrl, accessCode, reference } = await initializePaystackTransaction({
    orderId:     order.id,
    amountCents: order.total,
    email:       order.user.email,
    callbackUrl,
  });

  // Store the reference so we can verify it later
  await db.payment.updateMany({
    where: { orderId: order.id },
    data:  { transactionId: reference },
  });

  return ok({ authorizationUrl, accessCode, reference, publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY });
}