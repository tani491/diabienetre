import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { enforceApiRateLimit } from "@/lib/api-security";
import { analyticsPayloadSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parseResult = analyticsPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "Unknown";

    await db.pageView.create({
      data: {
        page: parseResult.data.page,
        referrer: parseResult.data.referrer || null,
        userAgent,
        ipAddress: ipAddress.split(",")[0].trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Page view tracking error:", error);
    return NextResponse.json({ error: "Erreur lors du suivi" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const totalViews = await db.pageView.count();
    const recentViews = await db.pageView.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const allViews = await db.pageView.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { ipAddress: true },
    });
    const uniqueIPs = new Set(allViews.map((v) => v.ipAddress));

    const viewsByPage = await db.pageView.groupBy({
      by: ["page"],
      _count: true,
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { page: "desc" } },
    });

    const topReferrers = await db.pageView.groupBy({
      by: ["referrer"],
      _count: true,
      where: {
        createdAt: { gte: thirtyDaysAgo },
        referrer: { not: null },
      },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    });

    const allTimeViews = await db.pageView.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    const viewsByDay: Record<string, number> = {};
    allTimeViews.forEach((view) => {
      const day = view.createdAt.toISOString().split("T")[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    return NextResponse.json({
      totalViews,
      recentViews,
      uniqueVisitors: uniqueIPs.size,
      viewsByPage,
      topReferrers,
      viewsByDay,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des analytics" }, { status: 500 });
  }
}
