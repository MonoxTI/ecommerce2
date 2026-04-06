// app/api/admin/products/[id]/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, created, badRequest } from "@/lib/api/response";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET /api/admin/products/[id]/images
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const images = await db.productImage.findMany({
    where:   { productId: id },
    orderBy: { createdAt: "asc" },
  });
  return ok(images);
}

// POST /api/admin/products/[id]/images
// Accepts multipart/form-data (file upload) OR JSON { url: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const contentType = req.headers.get("content-type") ?? "";

  // ── File upload ──────────────────────────────────────────
  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return badRequest("Failed to parse form data");
    }

    const file = formData.get("file") as File | null;
    if (!file) return badRequest("No file provided");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return badRequest("Only JPEG, PNG, WebP and GIF are allowed");
    }
    if (file.size > 5 * 1024 * 1024) {
      return badRequest("File size must be under 5MB");
    }

    const ext       = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename  = `${id}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(uploadDir, filename), buffer);

    const url   = `/uploads/${filename}`;
    const image = await db.productImage.create({ data: { productId: id, url } });
    return created(image, "Image uploaded successfully");
  }

  // ── URL ──────────────────────────────────────────────────
  let body: { url?: string } | null = null;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body?.url) return badRequest("url is required");

  const image = await db.productImage.create({
    data: { productId: id, url: body.url },
  });
  return created(image, "Image added successfully");
}