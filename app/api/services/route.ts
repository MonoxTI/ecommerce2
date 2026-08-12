// app/api/services/route.ts
import { db } from "@/lib/DB/prisma";
import { ok } from "@/lib/api/response";

export async function GET() {
  try {
    const services = await (db as any).service.findMany({
      where: { active: true },
      orderBy: { category: "asc" },
    });
    return ok(services);
  } catch { return ok([]); }
}