import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclure le dossier examples du build
  outputFileTracingExcludes: {
    '*': ['./examples/**', './node_modules/.cache'],
  },
};

export default nextConfig;
