// lib/api/response.ts
// Typed response helpers + safeHandler wrapper for consistent API responses.

import { NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod"; // 👈 Import ZodIssue for typing

// ─── TYPES ───────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── SUCCESS ─────────────────────────────────────────────────

export function ok<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) },
    { status }
  );
}

export function created<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccess<T>> {
  return ok(data, message, 201);
}

// ─── CLIENT ERRORS ───────────────────────────────────────────

export function badRequest(
  error: string,
  details?: Record<string, string[]>
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error, ...(details && { details }) },
    { status: 400 }
  );
}

export function unauthorized(
  error = "Unauthorized"
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 401 });
}

export function forbidden(
  error = "Forbidden"
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 403 });
}

export function notFound(
  error = "Not found"
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 404 });
}

export function conflict(error: string): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 409 });
}

// ─── SERVER ERROR ────────────────────────────────────────────

export function serverError(
  error = "Internal server error"
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 500 });
}

// ─── VALIDATION ERROR (Zod) ──────────────────────────────────

export function validationError(err: ZodError): NextResponse<ApiError> {
  const details: Record<string, string[]> = {};
  
  // 👇 FIXED: Use `issues` instead of `errors`
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "root";
    details[key] = details[key] ?? [];
    details[key].push(issue.message);
  }
  
  return badRequest("Validation failed", details);
}

// ─── SAFE HANDLER ────────────────────────────────────────────
// Wraps any route handler to catch unhandled errors gracefully.
// Without this, an uncaught error returns a blank 500 with no body.

export function safeHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      // Log full error server-side but never leak internals to client
      console.error("[API Error]", err);
      
      // 👇 FIXED: Check instanceof ZodError correctly
      if (err instanceof ZodError) {
        return validationError(err);
      }
      
      return serverError();
    }
  };
}

// ─── PAGINATION ──────────────────────────────────────────────

export function paginate(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}