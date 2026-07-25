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

  // Note: accessToken is intentionally NOT included in the response body.
  // It's already set as an httpOnly cookie — returning it here would
  // expose it to any client-side JS on the page (defeats the point of
  // httpOnly). The browser client should rely on the cookie alone.
  return ok({
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
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

  // accessToken intentionally omitted from the body — see handleLogin.
  return ok(null, "Token refreshed");
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

    // Store token in DB (you can add a PasswordReset model, or store on User).
    // Stored here as a "reset_"-prefixed refresh token. NOTE: rotateRefreshToken()
    // explicitly rejects any token with this prefix, so this token can only ever
    // be consumed by handleResetPassword() below — never used to log in.
    await db.refreshToken.create({
      data: {
        token:     `reset_${token}`,
        userId:    user.id,
        expiresAt,
      },
    });

    // Send password reset email
    const appUrl    = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetLink = `${appUrl}/auth/reset-password?token=${token}`;

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const FROM   = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

      await resend.emails.send({
        from:    FROM,
        to:      user.email,
        subject: "Reset your novaa password",
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; background: #F5F5F5;">
            <div style="background: #1A1A1A; padding: 28px 36px; text-align: center; margin-bottom: 0;">
              <h1 style="color: #fff; font-size: 28px; font-weight: 300; letter-spacing: 8px; margin: 0 0 4px;">novaa</h1>
              <p style="color: #B8965A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">elevated beauty, with purpose.</p>
            </div>
            <div style="background: #fff; padding: 40px 36px;">
              <h2 style="color: #1A1A1A; font-size: 22px; font-weight: 300; margin: 0 0 16px;">Reset your password</h2>
              <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
                Hi ${user.name?.split(" ")[0] ?? "there"},<br/><br/>
                We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}"
                  style="background: #1A1A1A; color: #fff; text-decoration: none; padding: 14px 32px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 24px 0 0;">
                If you didn&apos;t request this, you can safely ignore this email. Your password will not change.
              </p>
              <p style="color: #bbb; font-size: 11px; margin: 12px 0 0; word-break: break-all;">
                Or copy this link: ${resetLink}
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #aaa; font-size: 11px;">
              © ${new Date().getFullYear()} novaa. All rights reserved.
            </div>
          </div>
        `,
      });
      console.log(`[Auth] Password reset email sent to ${email}`);
    } catch (err) {
      console.error(`[Auth] Failed to send reset email to ${email}:`, err);
      // Don't expose email errors to the user
    }
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