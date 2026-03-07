// lib/auth/jwt.ts
// Access token:  15 minutes (short-lived, in-memory on client)
// Refresh token: 30 days   (opaque random string, stored in DB + HttpOnly cookie)

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/DB/prisma";
import { Role } from "@prisma/client";
import crypto from "crypto";

// ─── TYPES ───────────────────────────────────────────────────

export interface JWTPayload {
  sub: string;    // userId
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── CONSTANTS ───────────────────────────────────────────────

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
);

export const ACCESS_TOKEN_TTL   = 15 * 60;           // 15 min in seconds
export const REFRESH_TOKEN_TTL  = 30 * 24 * 60 * 60; // 30 days in seconds

export const ACCESS_COOKIE  = "ws_access";
export const REFRESH_COOKIE = "ws_refresh";

// ─── SIGN ────────────────────────────────────────────────────

export async function signAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
    .sign(ACCESS_SECRET);
}

// Refresh token is an opaque random string — NOT a JWT.
// Stored in DB so we can revoke it at any time.
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

// ─── VERIFY ──────────────────────────────────────────────────

export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ─── ISSUE PAIR ──────────────────────────────────────────────

export async function issueTokenPair(
  userId: string,
  email: string,
  role: Role
): Promise<TokenPair> {
  const accessToken  = await signAccessToken({ sub: userId, email, role });
  const refreshToken = generateRefreshToken();

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
  await db.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt },
  });

  return { accessToken, refreshToken };
}

// ─── COOKIES ─────────────────────────────────────────────────

export async function setAuthCookies(tokens: TokenPair): Promise<void> {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // Access token — readable by JS so the client can get the value once,
  // then store in memory. HttpOnly keeps it safe from XSS.
  cookieStore.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: "lax",
    maxAge:   ACCESS_TOKEN_TTL,
    path:     "/",
  });

  // Refresh token — restricted to /api/auth so it's never sent
  // on product/cart/order requests (minimises exposure).
  cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: "lax",
    maxAge:   REFRESH_TOKEN_TTL,
    path:     "/api/auth",
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

// ─── GET USER FROM REQUEST ───────────────────────────────────
// Works for both browser (cookie) and API client (Bearer header).

export async function getCurrentUser(
  request: Request
): Promise<JWTPayload | null> {
  // 1. Authorization header (Postman / mobile apps / SSR fetch)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifyAccessToken(authHeader.slice(7));
  }

  // 2. HttpOnly cookie (browser)
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ACCESS_COOKIE}=([^;]+)`)
  );
  if (match?.[1]) {
    return verifyAccessToken(match[1]);
  }

  return null;
}

// ─── REFRESH TOKEN ROTATION ──────────────────────────────────
// Old token is immediately revoked and a new pair is issued.
// If a revoked token is presented → possible theft → revoke ALL tokens.

export async function rotateRefreshToken(
  rawToken: string
): Promise<TokenPair | null> {
  const existing = await db.refreshToken.findUnique({
    where:   { token: rawToken },
    include: { user: true },
  });

  // Token not found, already revoked, expired, or account disabled
  if (
    !existing ||
    existing.revoked ||
    existing.expiresAt < new Date() ||
    !existing.user.isActive
  ) {
    // If it exists but was revoked → possible replay attack
    if (existing?.revoked) {
      await db.refreshToken.updateMany({
        where: { userId: existing.userId },
        data:  { revoked: true },
      });
    }
    return null;
  }

  // Revoke old token first
  await db.refreshToken.update({
    where: { id: existing.id },
    data:  { revoked: true },
  });

  // Issue fresh pair
  return issueTokenPair(
    existing.userId,
    existing.user.email,
    existing.user.role
  );
}

// ─── REVOKE ALL ──────────────────────────────────────────────

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await db.refreshToken.updateMany({
    where: { userId },
    data:  { revoked: true },
  });
}