import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    if (!customerName || !customerPhone || !items) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    // Sanitisation basique
    const sanitized = {
      customerName: String(customerName).trim().slice(0, 200),
      customerPhone: String(customerPhone).trim().slice(0, 20),
      customerAddress: String(customerAddress || '').trim().slice(0, 500),
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

    const order = await db.order.create({
      data: {
        customerName: sanitized.customerName,
        customerPhone: sanitized.customerPhone,
        customerAddress: sanitized.customerAddress,
        items: JSON.stringify(items),
        totalAmount: parsedTotal,
        waveRef: method === 'wave' ? String(waveRef).trim().slice(0, 100) : null,
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
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== 'Bearer admin-diabienetre') {
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
