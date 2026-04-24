import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-api";
import { enforceApiRateLimit } from "@/lib/api-security";
import { orderCreateSchema, orderStatusUpdateSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parseResult = orderCreateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const orderData = parseResult.data;

    if (orderData.paymentMethod === "wave") {
      if (!orderData.waveRef) {
        return NextResponse.json(
          { error: "La référence Wave est requise pour le paiement via Wave." },
          { status: 400 }
        );
      }

      if (!/^[A-Z0-9][A-Z0-9._\-]{5,49}$/i.test(orderData.waveRef)) {
        return NextResponse.json(
          {
            error:
              "Référence Wave invalide. Format attendu : ex. T241023.1234.567890",
          },
          { status: 400 }
        );
      }
    }

    const serverTotal = orderData.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    if (Math.abs(serverTotal - orderData.totalAmount) > 1) {
      return NextResponse.json(
        { error: "Le montant ne correspond pas au contenu du panier." },
        { status: 400 }
      );
    }

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const order = await db.order.create({
      data: {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        waveRef: orderData.paymentMethod === "wave" ? orderData.waveRef : null,
        paymentMethod: orderData.paymentMethod,
        status: orderData.paymentMethod === "whatsapp" ? "whatsapp_pending" : "pending",
        ipAddress: clientIp,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Échec de la commande." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = orderStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const order = await db.order.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
