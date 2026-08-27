"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useAppStore, type Page } from "@/lib/store";

interface ProductPageShellProps {
  children: ReactNode;
  logoUrl?: string | null;
}

export default function ProductPageShell({ children, logoUrl }: ProductPageShellProps) {
  const router = useRouter();
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onNavigate={handleNavigate} logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
