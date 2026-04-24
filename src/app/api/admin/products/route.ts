import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-api";
import { enforceApiRateLimit } from "@/lib/api-security";
import { idQuerySchema, productUpdateSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const updateData = { ...parsed.data };
    delete updateData.id;

    const product = await db.product.update({
      where: { id: parsed.data.id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = idQuerySchema.safeParse({ id: searchParams.get("id") ?? undefined });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((err) => err.message).join(", ") },
      { status: 400 }
    );
  }

  try {
    await db.product.update({
      where: { id: parsed.data.id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
