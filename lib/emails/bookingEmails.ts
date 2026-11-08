// lib/emails/bookingEmails.ts
// Emails for service bookings (deposit paid). Uses Resend like lib/emails/mailer.ts.
import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) { console.error("[Email] RESEND_API_KEY is not set — email not sent"); return null; }
  return (_resend ??= new Resend(key));
}

const FROM = process.env.EMAIL_FROM ?? "novaa <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const rand = (cents: number) => `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const longDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-ZA", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });

export type BookingEmailData = {
  id: string; date: string; startTime: string; endTime: string;
  notes?: string | null; depositAmount: number;
  service: { name: string; price: number; duration: number };
  user: { name: string; email: string; phone?: string | null };
};

function shell(title: string, body: string) {
  return `
  <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; background: #F5F5F5;">
    <div style="background: #1A1A1A; padding: 28px 36px; text-align: center;">
      <h1 style="color: #fff; font-size: 28px; font-weight: 300; letter-spacing: 8px; margin: 0 0 4px;">novaa</h1>
      <p style="color: #B8965A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">beauty, with purpose.</p>
    </div>
    <div style="background: #fff; padding: 36px;">
      <h2 style="color: #1A1A1A; font-size: 22px; font-weight: 300; margin: 0 0 16px;">${title}</h2>
      ${body}
    </div>
    <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">&copy; ${new Date().getFullYear()} novaa. All rights reserved.</div>
  </div>`;
}

function rows(pairs: [string, string][]) {
  return `<table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px; color:#333;">${pairs
    .map(([k, v]) => `<tr><td style="padding:8px 0; border-bottom:1px solid #eee; color:#888;">${esc(k)}</td><td style="padding:8px 0; border-bottom:1px solid #eee; text-align:right;">${v}</td></tr>`)
    .join("")}</table>`;
}

export async function sendBookingConfirmedEmail(a: BookingEmailData) {
  try {
    const resend = getResend();
    if (!resend) return false;
    const balance = Math.max(a.service.price - a.depositAmount, 0);
    const html = shell("Your booking is confirmed", `
      <p style="color:#555; font-size:14px; line-height:1.7; margin:0 0 8px;">Hi ${esc(a.user.name)},<br/><br/>
      Thank you — we've received your deposit and your appointment is booked.</p>
      ${rows([
        ["Service", esc(a.service.name)],
        ["Date", esc(longDate(a.date))],
        ["Time", `${esc(a.startTime)} – ${esc(a.endTime)}`],
        ["Service price", rand(a.service.price)],
        ["Deposit paid (50%)", `<strong>${rand(a.depositAmount)}</strong>`],
        ["Balance due on the day", `<strong>${rand(balance)}</strong>`],
        ["Booking ref", `#${esc(a.id.slice(-8).toUpperCase())}`],
      ])}
      <p style="color:#999; font-size:12px; line-height:1.6;">Need to change your booking? Reply to this email or contact us as early as possible. Deposits are non-refundable for cancellations.</p>
      <div style="text-align:center; margin:28px 0 0;">
        <a href="${APP_URL}/services" style="background:#1A1A1A; color:#fff; text-decoration:none; padding:14px 32px; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-family:Arial,sans-serif; font-weight:600; display:inline-block;">View my appointments</a>
      </div>`);
    const { error } = await resend.emails.send({ from: FROM, to: a.user.email, subject: `Booking confirmed — ${a.service.name}, ${a.date} ${a.startTime}`, html });
    if (error) { console.error("[Email] Booking confirmed email failed:", error); return false; }
    return true;
  } catch (err) {
    console.error("[Email] Unexpected error sending booking confirmed email:", err);
    return false;
  }
}

/** Notifies the shop owner(s). Set ADMIN_NOTIFY_EMAIL (comma-separated) in the environment. */
export async function sendAdminNewBookingEmail(a: BookingEmailData, note?: string) {
  try {
    const to = (process.env.ADMIN_NOTIFY_EMAIL ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (to.length === 0) return false;
    const resend = getResend();
    if (!resend) return false;
    const balance = Math.max(a.service.price - a.depositAmount, 0);
    const html = shell("New booking", `
      ${note ? `<p style="background:#FFF4E5; border:1px solid #F5C77E; color:#8A5A00; font-size:13px; padding:10px 14px;">${esc(note)}</p>` : ""}
      ${rows([
        ["Customer", esc(a.user.name)],
        ["Email", esc(a.user.email)],
        ["Phone", esc(a.user.phone ?? "—")],
        ["Service", esc(a.service.name)],
        ["Date", esc(longDate(a.date))],
        ["Time", `${esc(a.startTime)} – ${esc(a.endTime)}`],
        ["Deposit paid", rand(a.depositAmount)],
        ["Balance due", rand(balance)],
        ["Notes", esc(a.notes ?? "—")],
      ])}
      <div style="text-align:center; margin:24px 0 0;">
        <a href="${APP_URL}/admin/services" style="background:#1A1A1A; color:#fff; text-decoration:none; padding:14px 32px; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-family:Arial,sans-serif; font-weight:600; display:inline-block;">Open bookings</a>
      </div>`);
    const { error } = await resend.emails.send({ from: FROM, to, subject: `New booking — ${a.service.name}, ${a.date} ${a.startTime}`, html });
    if (error) { console.error("[Email] Admin new-booking email failed:", error); return false; }
    return true;
  } catch (err) {
    console.error("[Email] Unexpected error sending admin booking email:", err);
    return false;
  }
}