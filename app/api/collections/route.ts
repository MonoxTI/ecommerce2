// app/api/collections/route.ts
// GET /api/collections — returns active homepage collections ordered by position
import { NextRequest } from "next/server";
import { db } from "@/lib/DB/prisma";
import { ok } from "@/lib/api/response";

export async function GET() {
  const collections = await (db as any).homeCollection.findMany({
    where:   { active: true },
    orderBy: { order: "asc" },
  });
  return ok(collections);
}