import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLoginPage from "./AdminLoginPage";

export const metadata: Metadata = {
  title: "Connexion Admin - DiaBienEtre",
  robots: { index: false, follow: false },
};

export default function AdminLogin() {
  return (
    <Suspense fallback={null}>
      <AdminLoginPage />
    </Suspense>
  );
}
