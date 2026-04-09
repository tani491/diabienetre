import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne protéger que les routes /admin/*
  if (pathname.startsWith("/admin")) {
    // Autoriser la page de login sans authentification
    if (pathname === "/admin/login") {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      // Si déjà connecté, rediriger vers le dashboard
      if (token) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Protéger toutes les autres pages /admin/*
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Pas de token = pas connecté → rediriger vers login
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier que c'est bien l'admin autorisé
    if (token.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
