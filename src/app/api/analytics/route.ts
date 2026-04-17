import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { page, referrer } = await request.json();
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "Unknown";

    // Create page view record
    await db.pageView.create({
      data: {
        page: page || "/",
        referrer: referrer || null,
        userAgent,
        ipAddress: ipAddress.split(",")[0].trim(), // Get first IP if multiple
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Page view tracking error:", error);
    return NextResponse.json(
      { error: "Erreur lors du suivi" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get stats for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Total page views
    const totalViews = await db.pageView.count();
    const recentViews = await db.pageView.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Unique visitors (IP addresses)
    const allViews = await db.pageView.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { ipAddress: true },
    });
    const uniqueIPs = new Set(allViews.map((v) => v.ipAddress));

    // Views by page
    const viewsByPage = await db.pageView.groupBy({
      by: ["page"],
      _count: true,
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { page: "desc" } },
    });

    // Top referrers
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

    // Views over time (grouped by day)
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
    return NextResponse.json(
      { error: "Erreur lors de la récupération des analytics" },
      { status: 500 }
    );
  }
}
