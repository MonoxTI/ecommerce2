// app/api/cron/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/DB/prisma";

export async function GET(req: NextRequest) {
  // 1. Check for custom header OR Vercel's native cron auth header
  const customSecret = req.headers.get("x-cron-secret");
  const vercelCronAuth = req.headers.get("authorization"); // Vercel sends "Bearer <secret>"

  const isValidCustom = customSecret === process.env.CRON_SECRET;
  const isValidVercel = vercelCronAuth === `Bearer ${process.env.CRON_SECRET}`;

  if (!isValidCustom && !isValidVercel) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Delete rows older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await db.rateLimitWindow.deleteMany({
      where: {
        windowStart: {
          lt: twentyFourHoursAgo,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count,
      message: "Cleanup successful" 
    });
  } catch (error) {
    console.error("[Cron Cleanup] Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}