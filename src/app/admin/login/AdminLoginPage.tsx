"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-sage-600 via-sage-500 to-sage-700 flex items-center justify-center px-4 py-12">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sage-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-linear-to-br from-sage-400 to-sage-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-sage-800 mb-1">
              Administration
            </h1>
            <p className="text-sage-500 text-sm">
              Connectez-vous pour accéder au tableau de bord
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sage-700 text-sm font-medium mb-1.5 block">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="pl-11 pr-11 h-12 border-sage-200 focus:border-sage-400 focus:ring-sage-400/20 rounded-xl bg-sage-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium">
                    {showPassword ? "Masquer" : "Voir"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-linear-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Separator */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-sage-200" />
            <span className="text-xs text-sage-400">Sécurisé</span>
            <div className="flex-1 h-px bg-sage-200" />
          </div>

          {/* Back to site */}
          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-sage-500 hover:text-sage-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Retourner sur le site
          </button>
        </div>

        {/* Bottom text */}
        <p className="text-center text-white/40 text-xs mt-6">
          Accès réservé aux administrateurs de DiaBienEtre
        </p>
      </motion.div>
    </div>
  );
}
