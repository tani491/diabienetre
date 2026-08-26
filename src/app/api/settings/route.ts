import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-api";
import { enforceApiRateLimit } from "@/lib/api-security";
import { storeSettingsSchema } from "@/lib/validators";

const SETTINGS_ID = "main";
const DEFAULT_SETTINGS = {
  announcementText: "",
  announcementEnabled: true,
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const settings = await db.storeSettings.findUnique({
      where: { id: SETTINGS_ID },
    });

    return NextResponse.json(settings ?? DEFAULT_SETTINGS);
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(request: Request) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = storeSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const settings = await db.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: parsed.data,
      create: {
        id: SETTINGS_ID,
        ...parsed.data,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating store settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
