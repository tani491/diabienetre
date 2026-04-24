import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_API_REQUESTS_PER_WINDOW = 100;

export function getClientIp(request: Request | { headers: Headers }): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("fastly-client-ip") ||
    headers.get("true-client-ip") ||
    "unknown"
  );
}

export async function enforceApiRateLimit(request: Request) {
  const ipAddress = getClientIp(request);
  const route = new URL(request.url).pathname;

  if (ipAddress === "unknown") {
    return NextResponse.json(
      { error: "Impossible de détecter l'adresse IP du client." },
      { status: 400 }
    );
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
  const count = await db.apiRequest.count({
    where: {
      ipAddress,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  if (count >= MAX_API_REQUESTS_PER_WINDOW) {
    return NextResponse.json(
      {
        error: `Trop de requêtes. Limite de ${MAX_API_REQUESTS_PER_WINDOW} requêtes par ${RATE_LIMIT_WINDOW_MINUTES} minutes dépassée.`,
      },
      { status: 429 }
    );
  }

  await db.apiRequest.create({
    data: {
      ipAddress,
      route,
      method: request.method,
    },
  });

  return null;
}
