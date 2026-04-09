import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-api';

// Rate limiting simple en mémoire (par IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 commandes par minute max

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting par IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans une minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, totalAmount, waveRef, paymentMethod } = body;

    // Validation complète des champs requis
    if (!customerName || !customerPhone || !customerAddress || !items) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    // Sanitisation basique
    const sanitized = {
      customerName: String(customerName).trim().slice(0, 200),
      customerPhone: String(customerPhone).trim().slice(0, 20),
      customerAddress: String(customerAddress).trim().slice(0, 500),
    };

    const method = paymentMethod === 'whatsapp' ? 'whatsapp' : 'wave';
    if (method === 'wave' && !waveRef) {
      return NextResponse.json(
        { error: 'La référence Wave est requise pour le paiement via Wave' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      );
    }

    const parsedTotal = parseFloat(totalAmount);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    // Validation supplémentaire: vérifier que les montants des items correspondent
    const serverTotal = items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price);
      const qty = parseInt(item.quantity);
      return sum + (isNaN(price) ? 0 : price) * (isNaN(qty) ? 0 : qty);
    }, 0);

    if (Math.abs(serverTotal - parsedTotal) > 1) {
      return NextResponse.json(
        { error: 'Le montant ne correspond pas au contenu du panier' },
        { status: 400 }
      );
    }

    const order = await db.order.create({
      data: {
        customerName: sanitized.customerName,
        customerPhone: sanitized.customerPhone,
        customerAddress: sanitized.customerAddress,
        items: JSON.stringify(items),
        totalAmount: parsedTotal,
        waveRef: method === 'wave' ? String(waveRef).trim().slice(0, 100) : null,
        paymentMethod: method,
        status: method === 'whatsapp' ? 'whatsapp_pending' : 'pending',
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Échec de la commande' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Vérification admin via NextAuth (au lieu du Bearer token codé en dur)
    const { authorized } = await requireAdmin(request as unknown as import('next/server').NextRequest);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Vérification admin via NextAuth
    const { authorized } = await requireAdmin(request as unknown as import('next/server').NextRequest);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order ID et statut sont requis' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'whatsapp_pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
