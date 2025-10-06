import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar erros de ESLint durante build de produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante build  
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
