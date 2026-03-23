// proxy.ts ← project root (same level as package.json)

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/JWT";
import { PROTECTED_PREFIXES, ADMIN_PREFIXES } from "@/lib/middleware/auth";
import { Role } from "@prisma/client";

// ─── RATE LIMITER ────────────────────────────────────────────

interface RateLimitWindow {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitWindow>();

const LIMITS: Record<string, { windowMs: number; max: number }> = {
  "/api/auth/login":           { windowMs: 15 * 60_000, max: 10  },
  "/api/auth/register":        { windowMs: 60 * 60_000, max: 5   },
  "/api/auth/forgot-password": { windowMs: 60 * 60_000, max: 5   },
  "/api/auth/reset-password":  { windowMs: 60 * 60_000, max: 5   },
  "/api/payments/itn":         { windowMs: 60_000,       max: 100 },
  default:                     { windowMs: 60_000,       max: 120 },
};

function isAllowed(ip: string, pathname: string): boolean {
  const cfg = LIMITS[pathname] ?? LIMITS["default"];
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > cfg.windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= cfg.max) return false;
  entry.count++;
  return true;
}

// ─── SECURITY HEADERS ────────────────────────────────────────

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options",  "nosniff");
  res.headers.set("X-Frame-Options",         "DENY");
  res.headers.set("X-XSS-Protection",        "1; mode=block");
  res.headers.set("Referrer-Policy",         "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy",      "camera=(), microphone=(), geolocation=()");

  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.headers.set("Content-Security-Policy", [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.payfast.co.za",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://www.payfast.co.za https://sandbox.payfast.co.za",
      "frame-src https://www.payfast.co.za https://sandbox.payfast.co.za",
      "form-action 'self' https://www.payfast.co.za https://sandbox.payfast.co.za",
    ].join("; "));
  }

  return res;
}

// ─── TOKEN EXTRACTION ────────────────────────────────────────

function extractAccessToken(req: NextRequest): string | null {
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.cookies.get("ws_access")?.value ?? null;
}

// ─── REDIRECTS ───────────────────────────────────────────────

function toLogin(req: NextRequest): NextResponse {
  const url = new URL("/auth/login", req.url);
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function apiUnauth(message: string): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

// ─── PROXY HANDLER ───────────────────────────────────────────
// Next.js 16 uses proxy.ts with a function named "middleware"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpe?g|gif|svg|ico|webp|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── 1. Rate limiting ─────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";

  if (!isAllowed(ip, pathname)) {
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: "Too many requests — please slow down." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    );
  }

  // ── 2. Admin route guard ──────────────────────────────────
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    const token = extractAccessToken(req);
    if (!token) {
      return pathname.startsWith("/api/") ? apiUnauth("Unauthorized") : toLogin(req);
    }
    const user = await verifyAccessToken(token);
    if (!user) {
      return pathname.startsWith("/api/") ? apiUnauth("Session expired") : toLogin(req);
    }
    if (user.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }
  }

  // ── 3. Protected route guard ──────────────────────────────
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const token = extractAccessToken(req);
    if (!token) {
      return pathname.startsWith("/api/") ? apiUnauth("Unauthorized") : toLogin(req);
    }
    const user = await verifyAccessToken(token);
    if (!user) {
      return pathname.startsWith("/api/") ? apiUnauth("Session expired") : toLogin(req);
    }
  }

  // ── 4. Security headers on all responses ──────────────────
  return withSecurityHeaders(NextResponse.next());
}

// ─── MATCHER ─────────────────────────────────────────────────

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};