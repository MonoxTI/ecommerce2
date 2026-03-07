// lib/middleware/auth.ts
// Route guard wrappers for Next.js App Router handlers.
// Usage:
//   export const GET = requireAuth(safeHandler(async (req, { user }) => { ... }))
//   export const POST = requireAdmin(safeHandler(async (req, { user }) => { ... }))

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, JWTPayload } from "@/lib/auth/JWT";
import { Role } from "@prisma/client";

// ─── TYPES ───────────────────────────────────────────────────

export type AuthedContext = {
  params: Record<string, string>;
  user: JWTPayload;
};

export type RouteHandler = (
  req: NextRequest,
  ctx: AuthedContext
) => Promise<NextResponse>;

// ─── HELPERS ─────────────────────────────────────────────────

const unauth = (msg = "Unauthorized") =>
  NextResponse.json({ success: false, error: msg }, { status: 401 });

const forbidden = (msg = "Forbidden") =>
  NextResponse.json({ success: false, error: msg }, { status: 403 });

// ─── REQUIRE AUTH ────────────────────────────────────────────
// Any logged-in user (CUSTOMER or ADMIN).

export function requireAuth(handler: RouteHandler) {
  return async (
    req: NextRequest,
    ctx: { params: Record<string, string> }
  ) => {
    const user = await getCurrentUser(req);
    if (!user) return unauth();
    return handler(req, { ...ctx, user });
  };
}

// ─── REQUIRE ADMIN ───────────────────────────────────────────

export function requireAdmin(handler: RouteHandler) {
  return async (
    req: NextRequest,
    ctx: { params: Record<string, string> }
  ) => {
    const user = await getCurrentUser(req);
    if (!user) return unauth();
    if (user.role !== Role.ADMIN) return forbidden("Admin access required");
    return handler(req, { ...ctx, user });
  };
}

// ─── OPTIONAL AUTH ───────────────────────────────────────────
// Passes user if logged in, null if not.
// Useful for public routes that have personalised behaviour when logged in.

export type OptionalAuthContext = {
  params: Record<string, string>;
  user: JWTPayload | null;
};

export type OptionalHandler = (
  req: NextRequest,
  ctx: OptionalAuthContext
) => Promise<NextResponse>;

export function optionalAuth(handler: OptionalHandler) {
  return async (
    req: NextRequest,
    ctx: { params: Record<string, string> }
  ) => {
    const user = await getCurrentUser(req);
    return handler(req, { ...ctx, user });
  };
}

// ─── PROTECTED ROUTE PREFIXES ────────────────────────────────
// Used by middleware.ts to guard routes at the edge.

export const PROTECTED_PREFIXES = [
  "/api/cart",
  "/api/orders",
  "/api/addresses",
  "/api/reviews",
  "/account",
  "/checkout",
];

export const ADMIN_PREFIXES = ["/api/admin", "/admin"];