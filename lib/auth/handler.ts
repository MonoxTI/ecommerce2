// lib/auth/handlers.ts
// Core logic for all auth API routes.
// Each route file in app/api/auth/* is a thin wrapper that calls these.

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/DB/prisma";
import {
  issueTokenPair,
  setAuthCookies,
  clearAuthCookies,
  rotateRefreshToken,
  revokeAllUserTokens,
  REFRESH_COOKIE,
  getCurrentUser,
} from "@/lib/auth/JWT";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  conflict,
  notFound,
  validationError,
  serverError,
} from "@/lib/api/response";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} from "@/lib/validation/schemas";
import crypto from "crypto";

const BCRYPT_ROUNDS = 12;

// ─── REGISTER ────────────────────────────────────────────────
// POST /api/auth/register

export async function handleRegister(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { name, email, password, phone } = parsed.data;

  // Check if email already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await db.user.create({
    data: { name, email, password: passwordHash, phone },
    select: { id: true, email: true, name: true, role: true },
  });

  // TODO: Send verification email
  // await sendVerificationEmail(user.email, token)

  return created(
    { userId: user.id, email: user.email },
    "Account created successfully. Please log in."
  );
}

// ─── LOGIN ───────────────────────────────────────────────────
// POST /api/auth/login

export async function handleLogin(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });

  // Always run bcrypt even if user not found — prevents timing attacks
  // that could be used to enumerate valid email addresses
  const dummyHash = "$2a$12$dummy.hash.to.prevent.timing.attacks.padding";
  const isMatch = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, dummyHash);

  if (!user || !isMatch) {
    return unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    return unauthorized("Your account has been deactivated. Please contact support.");
  }

  const tokens = await issueTokenPair(user.id, user.email, user.role);
  await setAuthCookies(tokens);

  return ok({
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
    accessToken: tokens.accessToken,
  });
}

// ─── LOGOUT ──────────────────────────────────────────────────
// POST /api/auth/logout

export async function handleLogout(req: NextRequest) {
  // Revoke the refresh token from DB
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]+)`)
  );

  if (match?.[1]) {
    await db.refreshToken
      .updateMany({
        where: { token: match[1] },
        data:  { revoked: true },
      })
      .catch(() => {}); // don't fail if token not found
  }

  await clearAuthCookies();
  return ok(null, "Logged out successfully");
}

// ─── REFRESH ─────────────────────────────────────────────────
// POST /api/auth/refresh
// Silently rotates tokens — call this when access token expires

export async function handleRefresh(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]+)`)
  );

  if (!match?.[1]) return unauthorized("No refresh token found");

  const tokens = await rotateRefreshToken(match[1]);
  if (!tokens) {
    await clearAuthCookies();
    return unauthorized("Session expired. Please log in again.");
  }

  await setAuthCookies(tokens);
  return ok({ accessToken: tokens.accessToken }, "Token refreshed");
}

// ─── ME ──────────────────────────────────────────────────────
// GET /api/auth/me — returns current logged-in user

export async function handleMe(req: NextRequest) {
  const jwtUser = await getCurrentUser(req);
  if (!jwtUser) return unauthorized();

  const user = await db.user.findUnique({
    where:  { id: jwtUser.sub },
    select: {
      id:        true,
      name:      true,
      email:     true,
      phone:     true,
      role:      true,
      isActive:  true,
      createdAt: true,
      _count: {
        select: { orders: true, reviews: true },
      },
    },
  });

  if (!user) return unauthorized("User not found");
  return ok(user);
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────
// POST /api/auth/forgot-password

export async function handleForgotPassword(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = ForgotPasswordSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  // Always return the same response — never reveal if email exists
  if (user) {
    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in DB (you can add a PasswordReset model, or store on User)
    // For now we store it as a special refresh token with a prefix
    await db.refreshToken.create({
      data: {
        token:     `reset_${token}`,
        userId:    user.id,
        expiresAt,
      },
    });

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, token)
    // Reset link: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
  }

  return ok(
    null,
    "If an account with that email exists, a reset link has been sent."
  );
}

// ─── RESET PASSWORD ──────────────────────────────────────────
// POST /api/auth/reset-password

export async function handleResetPassword(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = ResetPasswordSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { token, password } = parsed.data;

  // Find the reset token
  const resetRecord = await db.refreshToken.findUnique({
    where: { token: `reset_${token}` },
  });

  if (
    !resetRecord ||
    resetRecord.revoked ||
    resetRecord.expiresAt < new Date()
  ) {
    return badRequest("This reset link is invalid or has expired.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Update password + revoke all sessions (force re-login)
  await db.$transaction([
    db.user.update({
      where: { id: resetRecord.userId },
      data:  { password: passwordHash },
    }),
    db.refreshToken.updateMany({
      where: { userId: resetRecord.userId },
      data:  { revoked: true },
    }),
  ]);

  return ok(null, "Password reset successfully. Please log in.");
}

// ─── CHANGE PASSWORD ─────────────────────────────────────────
// POST /api/auth/change-password (requires auth)

export async function handleChangePassword(req: NextRequest) {
  const jwtUser = await getCurrentUser(req);
  if (!jwtUser) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { currentPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({ where: { id: jwtUser.sub } });
  if (!user) return unauthorized();

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return badRequest("Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  // Update password + revoke all existing sessions
  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data:  { password: passwordHash },
    }),
    db.refreshToken.updateMany({
      where: { userId: user.id },
      data:  { revoked: true },
    }),
  ]);

  await clearAuthCookies();
  return ok(null, "Password changed successfully. Please log in again.");
}