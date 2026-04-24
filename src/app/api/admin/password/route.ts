import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { enforceApiRateLimit } from "@/lib/api-security";
import { adminPasswordSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Password change endpoint available" });
  } catch (error) {
    console.error("Password route GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = adminPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const { oldPassword, newPassword } = parseResult.data;
    let isValidOldPassword = false;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@diabienetre.sn";

    if (process.env.ADMIN_PASSWORD && oldPassword === process.env.ADMIN_PASSWORD) {
      isValidOldPassword = true;
    } else {
      const adminUser = await db.user.findUnique({ where: { email: adminEmail } });
      if (adminUser && adminUser.password) {
        isValidOldPassword = await bcrypt.compare(oldPassword, adminUser.password);
      }
    }

    if (!isValidOldPassword) {
      return NextResponse.json(
        { error: "Ancien mot de passe incorrect" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword },
      create: {
        email: adminEmail,
        name: "Admin DiaBienEtre",
        password: hashedPassword,
        role: "admin",
      },
    });

    return NextResponse.json({ message: "Mot de passe changé avec succès", success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
