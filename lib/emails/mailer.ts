// lib/emails/mailer.ts
// Central email sending service using Resend.
// Import this wherever you need to send emails.

import { Resend } from "resend";
import OrderConfirmed from "@/emails/OrderConfirmed";
import OrderShipped   from "@/emails/OrderShipped";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Your verified sending domain — update this once you verify your domain in Resend.
// Until then, use "onboarding@resend.dev" which works for testing (sends only to your account email).
const FROM = process.env.EMAIL_FROM ?? "novaa <onboarding@resend.dev>";
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


// ─── PASSWORD RESET ──────────────────────────────────────────

export async function sendPasswordResetEmail(params: {
  to:        string;
  firstName: string;
  resetLink: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from:    FROM,
      to:      params.to,
      subject: "Reset your novaa password",
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; background: #F5F5F5;">
          <div style="background: #1A1A1A; padding: 28px 36px; text-align: center;">
            <h1 style="color: #fff; font-size: 28px; font-weight: 300; letter-spacing: 8px; margin: 0 0 4px;">novaa</h1>
            <p style="color: #B8965A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">beauty, with purpose.</p>
          </div>
          <div style="background: #fff; padding: 40px 36px;">
            <h2 style="color: #1A1A1A; font-size: 22px; font-weight: 300; margin: 0 0 16px;">Reset your password</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
              Hi ${params.firstName},<br/><br/>
              We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${params.resetLink}"
                style="background: #1A1A1A; color: #fff; text-decoration: none; padding: 14px 32px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 24px 0 0;">
              If you didn't request this, you can safely ignore this email. Your password will not change.
            </p>
            <p style="color: #bbb; font-size: 11px; margin: 12px 0 0; word-break: break-all;">
              Or copy this link: ${params.resetLink}
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
            &copy; ${new Date().getFullYear()} novaa. All rights reserved.
          </div>
        </div>
      `,
    });
    if (error) {
      console.error("[Email] Failed to send password reset email:", error);
      return false;
    }
    console.log(`[Email] ✅ Password reset email sent to ${params.to}`);
    return true;
  } catch (err) {
    console.error("[Email] Unexpected error sending password reset email:", err);
    return false;
  }
}