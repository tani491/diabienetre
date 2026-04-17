import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimisations de production
  compress: true,
  poweredByHeader: false,

  // Images optimisées
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Exclure le dossier examples du build
  outputFileTracingExcludes: {
    "*": ["./examples/**", "./node_modules/.cache"],
  },

  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_APP_NAME: "DiaBienEtre",
    NEXT_PUBLIC_WAVE_NUMBER: "775278596",
    NEXT_PUBLIC_WHATSAPP_NUMBER: "221775278596",
  },
};

export default nextConfig;
