import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { active: true };
    if (category && category !== 'all') {
      where.category = category;
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Vérification admin via NextAuth (au lieu du Bearer token codé en dur)
    const { authorized } = await requireAdmin(request as unknown as import('next/server').NextRequest);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, image, category, stock, featured } = body;

    if (!name || !price || !image || !category) {
      return NextResponse.json(
        { error: 'Nom, prix, image et catégorie sont requis' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name: String(name).trim(),
        description: String(description || '').trim(),
        price: parseFloat(price),
        image: String(image).trim(),
        category: String(category).trim(),
        stock: parseInt(stock) || 0,
        featured: featured || false,
        active: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
