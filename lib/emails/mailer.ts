// lib/emails/mailer.ts
// Central email sending service using Resend.
// Import this wherever you need to send emails.

import { Resend } from "resend";
import OrderConfirmed from "../../app/emails/OrderConfirmed";
import OrderShipped   from "../../app/emails/OrderShipped";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Your verified sending domain — update this once you verify your domain in Resend.
// Until then, use "onboarding@resend.dev" which works for testing (sends only to your account email).
const FROM = process.env.EMAIL_FROM ?? "novaa <info@novaa.co.za>";
const APP_URL = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── ORDER CONFIRMED ─────────────────────────────────────────

export async function sendOrderConfirmedEmail(params: {
  to:           string;
  customerName: string;
  orderId:      string;
  orderDate:    string;
  items: {
    name:     string;
    variant:  string;
    quantity: number;
    price:    number; // cents
  }[];
  subtotal: number;
  shipping: number;
  total:    number;
  address: {
    fullName:   string;
    street:     string;
    city:       string;
    province:   string;
    postalCode: string;
    country:    string;
  };
}) {
  try {
    const { data, error } = await resend.emails.send({
      from:    FROM,
      to:      params.to,
      subject: `Order Confirmed — #${params.orderId.slice(0, 8).toUpperCase()}`,
      react:   OrderConfirmed({
        customerName: params.customerName,
        orderId:      params.orderId,
        orderDate:    params.orderDate,
        items:        params.items,
        subtotal:     params.subtotal,
        shipping:     params.shipping,
        total:        params.total,
        address:      params.address,
        orderUrl:     `${APP_URL}/account/orders/${params.orderId}`,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send order confirmed email:", error);
      return false;
    }

    console.log(`[Email] ✅ Order confirmed email sent to ${params.to} — id: ${data?.id}`);
    return true;
  } catch (err) {
    console.error("[Email] Unexpected error sending order confirmed email:", err);
    return false;
  }
}

// ─── ORDER SHIPPED ───────────────────────────────────────────

export async function sendOrderShippedEmail(params: {
  to:              string;
  customerName:    string;
  orderId:         string;
  trackingNumber?: string;
  trackingUrl?:    string;
  courier?:        string;
  estimatedDays?:  string;
  items: {
    name:     string;
    variant:  string;
    quantity: number;
  }[];
}) {
  try {
    const { data, error } = await resend.emails.send({
      from:    FROM,
      to:      params.to,
      subject: `Your Order Is On Its Way — #${params.orderId.slice(0, 8).toUpperCase()}`,
      react:   OrderShipped({
        customerName:   params.customerName,
        orderId:        params.orderId,
        trackingNumber: params.trackingNumber,
        trackingUrl:    params.trackingUrl,
        courier:        params.courier,
        estimatedDays:  params.estimatedDays,
        items:          params.items,
        orderUrl:       `${APP_URL}/account/orders/${params.orderId}`,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send order shipped email:", error);
      return false;
    }

    console.log(`[Email] ✅ Order shipped email sent to ${params.to} — id: ${data?.id}`);
    return true;
  } catch (err) {
    console.error("[Email] Unexpected error sending order shipped email:", err);
    return false;
  }
}