// app/api/cron/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/DB/prisma";
import { expireStaleHolds } from "@/lib/appointments/holds";

export async function GET(req: NextRequest) {
  const customSecret = req.headers.get("x-cron-secret");
  const vercelCronAuth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  // Fail closed if CRON_SECRET is not set
  if (!secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (customSecret !== secret && vercelCronAuth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await db.rateLimitWindow.deleteMany({
      where: { windowStart: { lt: twentyFourHoursAgo } },
    });
    const expiredHolds = await expireStaleHolds();

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      expiredBookingHolds: expiredHolds,
      message: "Cleanup successful",
    });
  } catch (error) {
    console.error("[Cron Cleanup] Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}