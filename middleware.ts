import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const SECURITY_HEADERS: Array<{ key: string; value: string }> = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; base-uri 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; form-action 'self';",
  },
];

function applySecurityHeaders(response: NextResponse) {
  SECURITY_HEADERS.forEach(({ key, value }) => response.headers.set(key, value));
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  if (pathname.startsWith("/admin")) {
    if (!secret) {
      console.error("NEXTAUTH_SECRET must be defined to protect admin routes.");
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }

    if (pathname === "/admin/login") {
      const token = await getToken({ req: request, secret });
      if (token) {
        return applySecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
      }
      return applySecurityHeaders(NextResponse.next());
    }

    const token = await getToken({ req: request, secret });
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (process.env.ADMIN_EMAIL && token.email !== process.env.ADMIN_EMAIL) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
