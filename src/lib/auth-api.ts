import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * Vérifie que l'utilisateur est un admin authentifié via NextAuth session.
 * À utiliser dans les API routes au lieu du Bearer token codé en dur.
 */
export async function requireAdmin(request: NextRequest): Promise<{ authorized: boolean; session: any }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { authorized: false, session: null };
    }

    // Vérifier que c'est bien l'admin autorisé
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && session.user.email !== adminEmail) {
      return { authorized: false, session };
    }

    // Vérifier le rôle admin
    if ((session.user as any).role !== "admin") {
      return { authorized: false, session };
    }

    return { authorized: true, session };
  } catch (error) {
    console.error("Auth check failed:", error);
    return { authorized: false, session: null };
  }
}
