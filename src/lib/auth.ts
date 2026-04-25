import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET must be defined in environment variables");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@diabienetre.sn" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const inputPassword = credentials?.password;
  // Si le formulaire n'envoie pas d'email, on utilise celui de Vercel
  const inputEmail = credentials?.email || adminEmail;

  // 1. On vérifie que TOUT existe avant de continuer
  // Ça enlève l'erreur rouge car TypeScript est sûr que ce ne sont pas des "undefined"
  if (!inputEmail || !inputPassword || !adminEmail || !adminPassword) {
    console.error("Identifiants manquants dans les variables d'environnement.");
    return null;
  }

  // 2. LA VÉRIFICATION (Maintenant TypeScript est content)
  if (
    inputEmail.trim() === adminEmail.trim() && 
    inputPassword.trim() === adminPassword.trim()
  ) {
    console.log("Connexion réussie !");
    return {
      id: "admin-id",
      email: adminEmail,
      name: "Admin DiaBienEtre",
      role: "admin",
    };
  }

  console.error("Échec : Le mot de passe ne correspond pas.");
  return null;
},
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 heures (admin session courte)
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/admin`;
    },
  },
  secret: nextAuthSecret,
};
