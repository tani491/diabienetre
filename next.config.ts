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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; img-src 'self' data: blob: https: *; font-src 'self' data: *; connect-src 'self' https://*.supabase.co *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
