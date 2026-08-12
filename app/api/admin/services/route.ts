// app/api/admin/services/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { requireAdminUser, isErrorResponse } from "@/lib/admin/guard";
import { ok, created, badRequest } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const services = await (db as any).service.findMany({ orderBy: { category: "asc" } });
  return ok(services);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminUser(req);
  if (isErrorResponse(guard)) return guard;
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.duration || !body?.price || !body?.category)
    return badRequest("name, duration, price and category are required");
  const service = await (db as any).service.create({
    data: {
      name:        body.name,
      description: body.description ?? "",
      duration:    Number(body.duration),
      price:       Number(body.price),
      category:    body.category,
      active:      body.active ?? true,
    },
  });
  return created(service, "Service created");
}