import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Verify admin password (for validation)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Password change endpoint available" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT - Change admin password
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Old password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check old password against env var default or database
    let isValidOldPassword = false;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@diabienetre.sn";

    // Check against env-var password first
    if (process.env.ADMIN_PASSWORD && oldPassword === process.env.ADMIN_PASSWORD) {
      isValidOldPassword = true;
    } else {
      // Check against database password if exists
      const adminUser = await db.user.findUnique({
        where: { email: adminEmail },
      });

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

    // Hash new password
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
