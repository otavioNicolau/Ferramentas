import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para Netlify
  output: 'standalone',
  trailingSlash: true,
  
  // Configurações de imagem para Netlify
  images: {
    unoptimized: true,
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
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
