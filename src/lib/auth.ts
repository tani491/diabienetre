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
        // 1. On récupère les infos de Vercel
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD; // On va utiliser la version simple

        // 2. On récupère ce que tu as tapé dans le formulaire
        const inputPassword = credentials?.password;
        // Si le formulaire n'a pas d'email, on prend celui de Vercel par défaut
        const inputEmail = credentials?.email || adminEmail;

        if (!inputEmail || !inputPassword) {
          return null;
        }

        // 3. LA VÉRIFICATION (Simple et efficace)
        if (inputEmail === adminEmail && inputPassword === adminPassword) {
          return {
            id: "admin",
            email: adminEmail,
            name: "Admin DiaBienEtre",
            role: "admin",
          };
        }

        // Si ce n'est pas l'admin, on peut toujours chercher dans la DB (optionnel)
        const user = await db.user.findUnique({
          where: { email: inputEmail as string },
        });

        if (user && user.password && user.role === "admin") {
          const isValidPassword = await bcrypt.compare(inputPassword, user.password);
          if (isValidPassword) {
            return { id: user.id, email: user.email, name: user.name, role: user.role };
          }
        }

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
