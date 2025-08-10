import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para Netlify
  output: 'standalone',
  trailingSlash: true,
  
  // Configurações de imagem para Netlify
  images: {
    unoptimized: true,
  },

  // Ignore TypeScript and ESLint errors during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuração webpack existente
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist': 'pdfjs-dist/legacy/build/pdf',
    };
    return config;
  },
  
  serverExternalPackages: ['@tobyg74/tiktok-api-dl'],
  
  // Configurações para evitar problemas no build
  // experimental: {
  //   esmExternals: 'loose',
  // },
};

export default nextConfig;
