import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment için optimize edildi
  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "localhost" },
    ],
    unoptimized: false,
  },

  // Vercel'de build optimizasyonu
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint build sırasında kontrol etme - Vercel için geçici olarak kapatıldı
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
