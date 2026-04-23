import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-api';

// Rate limiting via DB — works on serverless (Vercel) unlike in-memory Maps
async function checkRateLimit(ip: string): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const count = await db.order.count({
    where: { ipAddress: ip, createdAt: { gte: oneMinuteAgo } },
  });
  return count < 5;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans une minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, totalAmount, waveRef, paymentMethod } = body;

    if (!customerName || !customerPhone || !customerAddress || !items) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    const sanitized = {
      customerName: String(customerName).trim().slice(0, 200),
      customerPhone: String(customerPhone).trim().slice(0, 20),
      customerAddress: String(customerAddress).trim().slice(0, 500),
    };

    const method = paymentMethod === 'whatsapp' ? 'whatsapp' : 'wave';
    if (method === 'wave') {
      if (!waveRef) {
        return NextResponse.json(
          { error: 'La référence Wave est requise pour le paiement via Wave' },
          { status: 400 }
        );
      }
      const waveRefStr = String(waveRef).trim();
      if (!/^[A-Z0-9][A-Z0-9._\-]{5,49}$/i.test(waveRefStr)) {
        return NextResponse.json(
          { error: 'Référence Wave invalide. Format attendu : ex. T241023.1234.567890' },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }

    const parsedTotal = parseFloat(totalAmount);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

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
        items,                                                          // Json — Prisma sérialise directement
        totalAmount: parsedTotal,
        waveRef: method === 'wave' ? String(waveRef).trim().slice(0, 100) : null,
        paymentMethod: method,
        status: method === 'whatsapp' ? 'whatsapp_pending' : 'pending',
        ipAddress: ip,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Échec de la commande' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db.order.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID et statut sont requis' }, { status: 400 });
    }

    const validStatuses = ['pending', 'whatsapp_pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const order = await db.order.update({ where: { id }, data: { status } });
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
