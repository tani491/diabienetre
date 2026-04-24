import { NextResponse } from "next/server";

const WINDOW_MINUTES = 15;
const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;

// Routes d'authentification : limite stricte pour bloquer le brute-force
const AUTH_ROUTE_LIMIT = 10;
const DEFAULT_LIMIT = 100;

const AUTH_ROUTE_PREFIXES = ["/api/auth"];

// In-memory store for rate limiting (simple Map, not persistent across restarts)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function routeLimit(route: string): number {
  return AUTH_ROUTE_PREFIXES.some((p) => route.startsWith(p))
    ? AUTH_ROUTE_LIMIT
    : DEFAULT_LIMIT;
}

// Validation format IPv4 / IPv6 pour empêcher le spoofing via valeurs malformées
function isValidIp(ip: string): boolean {
  if (ip.length > 45) return false;
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip.split(".").every((seg) => parseInt(seg, 10) <= 255);
  }
  // IPv6 (notation compacte incluse)
  if (/^[0-9a-f:]{2,45}$/i.test(ip)) return true;
  return false;
}

export function getClientIp(request: Request | { headers: Headers }): string | null {
  const h = request.headers;

  // X-Forwarded-For : prendre uniquement la première IP (la plus proche du client)
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0].trim().substring(0, 45);
    if (isValidIp(ip)) return ip;
  }

  const candidates = [
    h.get("x-real-ip"),
    h.get("cf-connecting-ip"),
    h.get("fastly-client-ip"),
    h.get("true-client-ip"),
  ];
  for (const raw of candidates) {
    if (raw) {
      const ip = raw.trim().substring(0, 45);
      if (isValidIp(ip)) return ip;
    }
  }

  return null;
}

export async function enforceApiRateLimit(request: Request) {
  const ipAddress = getClientIp(request);
  const route = new URL(request.url).pathname;

  if (!ipAddress) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const limit = routeLimit(route);
  const now = Date.now();
  const key = `${ipAddress}:${route}`;

  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + WINDOW_MS });
  } else {
    entry.count++;
  }

  const current = rateLimitStore.get(key)!;
  if (current.count > limit) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez plus tard." },
      {
        status: 429,
        headers: {
          "Retry-After": String(WINDOW_MINUTES * 60),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(current.resetTime / 1000)),
        },
      }
    );
  }

  return null;
}
