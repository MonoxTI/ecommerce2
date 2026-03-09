// lib/admin/guard.ts
// Reusable admin auth guard.
// Every admin handler calls requireAdminUser() at the top.

import { NextRequest } from "next/server";
import { getCurrentUser, JWTPayload } from "@/lib/auth/JWT";
import { unauthorized, forbidden } from "@/lib/api/response";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function requireAdminUser(
  req: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  if (user.role !== Role.ADMIN) return forbidden("Admin access required");
  return { user };
}

// Type guard to check if result is an error response
export function isErrorResponse(
  result: { user: JWTPayload } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}