// proxy.ts (or middleware.ts)
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/JWT";
import { PROTECTED_PREFIXES, ADMIN_PREFIXES } from "@/lib/middleware/auth";
import { Role } from "@prisma/client";
import { db } from "@/lib/DB/prisma"; // ✅ TOP-LEVEL IMPORT: Cached and initialized once

// ─── RATE LIMITER ─────────────────────────────────────────────
const LIMITS: Record<string, { windowMs: number; max: number }> = {
  "/api/auth/login":           { windowMs: 15 * 60_000, max: 10 },
  "/api/auth/register":        { windowMs: 60 * 60_000, max: 5  },
  "/api/auth/forgot-password": { windowMs: 60 * 60_000, max: 5  },
  "/api/auth/reset-password":  { windowMs: 60 * 60_000, max: 5  },
  "/api/payments/yoco-webhook":{ windowMs: 60_000,       max: 200 },
  default:                     { windowMs: 60_000,       max: 150 },
};

async function checkRateLimit(ip: string, pathname: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  if (!pathname.startsWith("/api/")) return { allowed: true };

  const cfg = LIMITS[pathname] ?? LIMITS["default"];
  const windowSec = Math.floor(cfg.windowMs / 1000);
  const key = `${ip}:${pathname}`;

  try {
    // ✅ Use the top-level imported `db` directly (No dynamic import)
    const result = await (db as any).$queryRaw`
      INSERT INTO rate_limit_windows (key, count, window_start)
      VALUES (${key}, 1, NOW())
      ON CONFLICT (key)
      DO UPDATE SET
        count = CASE
          WHEN EXTRACT(EPOCH FROM (NOW() - rate_limit_windows.window_start)) > ${windowSec}
          THEN 1
          ELSE rate_limit_windows.count + 1
        END,
        window_start = CASE
          WHEN EXTRACT(EPOCH FROM (NOW() - rate_limit_windows.window_start)) > ${windowSec}
          THEN NOW()
          ELSE rate_limit_windows.window_start
        END
      RETURNING count, window_start
    `;

    const row = Array.isArray(result) ? result[0] : result;
    const count = Number(row?.count ?? 0);
    
    if (count > cfg.max) {
      const windowStart = new Date(row.window_start).getTime();
      const expiresAt = windowStart + cfg.windowMs;
      const retryAfter = Math.ceil((expiresAt - Date.now()) / 1000);
      return { allowed: false, retryAfter: Math.max(1, retryAfter) };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error("[Rate Limit] DB error, failing open:", error);
    return { allowed: true };
  }
}

// ─── SECURITY HEADERS ─────────────────────────────────────────
function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.headers.set("Content-Security-Policy", [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self'",
      "frame-src https://payments.yoco.com",
      "form-action 'self' https://payments.yoco.com",
    ].join("; "));
  }
  return res;
}

// ─── COOKIE-ONLY AUTH ─────────────────────────────────────────
function extractAccessToken(req: NextRequest): string | null {
  return req.cookies.get("ws_access")?.value ?? null;
}

function toLogin(req: NextRequest): NextResponse {
  const url = new URL("/auth/login", req.url);
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function apiUnauth(message: string): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

// ─── PROXY HANDLER ────────────────────────────────────────────
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. Skip Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpe?g|gif|svg|ico|webp|woff2?|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1. Rate limiting (MUST run first)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded 
    ? forwarded.split(",")[0].trim() 
    : req.headers.get("x-real-ip") ?? "unknown";

  const { allowed, retryAfter } = await checkRateLimit(ip, pathname);
  
  if (!allowed) {
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: "Too many requests — please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
      )
    );
  }

  // 2. Cron routes bypass auth
  if (pathname.startsWith("/api/cron/")) {
    return withSecurityHeaders(NextResponse.next());
  }

  // 3. Webhook routes bypass auth (verified by signature inside handler)
  const webhookPaths = [
    "/api/payments/yoco-webhook",
    "/api/payments/itn",
    "/api/payments/payfast-notify",
  ];
  if (webhookPaths.some(p => pathname === p)) {
    return withSecurityHeaders(NextResponse.next());
  }

  // 4. Admin guard
  if (ADMIN_PREFIXES.some(p => pathname.startsWith(p))) {
    const token = extractAccessToken(req);
    if (!token) return pathname.startsWith("/api/") ? apiUnauth("Unauthorized") : toLogin(req);
    
    const user = await verifyAccessToken(token);
    if (!user) return pathname.startsWith("/api/") ? apiUnauth("Session expired. Please sign in again.") : toLogin(req);
    if (user.role !== Role.ADMIN) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }
  }

  // 5. Protected route guard
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    const token = extractAccessToken(req);
    if (!token) return pathname.startsWith("/api/") ? apiUnauth("Unauthorized") : toLogin(req);
    
    const user = await verifyAccessToken(token);
    if (!user) return pathname.startsWith("/api/") ? apiUnauth("Session expired. Please sign in again.") : toLogin(req);
  }

  // 6. Apply security headers
  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};