import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Vérifie que l'utilisateur est un admin authentifié via NextAuth session.
 * Sécurise les API routes admin sans token codé en dur.
 */
export async function requireAdmin(): Promise<{ authorized: boolean; session: any }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { authorized: false, session: null };
    }

    // Vérifier le rôle admin
    const user = session.user as any;
    if (user.role !== "admin") {
      return { authorized: false, session };
    }

    // Vérifier que c'est bien l'admin autorisé (si ADMIN_EMAIL est configuré)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email !== adminEmail) {
      return { authorized: false, session };
    }

    return { authorized: true, session };
  } catch (error) {
    console.error("Auth check failed:", error);
    return { authorized: false, session: null };
  }
}
