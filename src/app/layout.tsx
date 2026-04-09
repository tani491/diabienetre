import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiaBienEtre - Bien-Être & Beauté Naturelle",
  description: "Découvrez nos produits capillaires et soins de la peau 100% naturels. Huiles, beurres, sérums et crèmes pour sublimer votre beauté au quotidien.",
  keywords: ["DiaBienEtre", "beauté", "bien-être", "produits naturels", "soins cheveux", "soins peau", "Sénégal"],
  authors: [{ name: "DiaBienEtre" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "DiaBienEtre - Bien-Être & Beauté Naturelle",
    description: "Découvrez nos produits capillaires et soins de la peau 100% naturels",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                border: "1px solid oklch(0.91 0.015 80)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
