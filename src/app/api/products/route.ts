import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-api";
import { enforceApiRateLimit } from "@/lib/api-security";
import { categoryQuerySchema, productCreateSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = categoryQuerySchema.safeParse({ category: searchParams.get("category") ?? undefined });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { active: true };
    if (parsed.data.category && parsed.data.category !== "all") {
      where.category = parsed.data.category;
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        image: parsed.data.image,
        category: parsed.data.category,
        stock: parsed.data.stock,
        featured: parsed.data.featured,
        active: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
