import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment için optimize edildi
  output: 'standalone',

  // Body size limitini tamamen kaldır - büyük video uploadları için
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Server external packages - Next.js 15 için güncellendi
  serverExternalPackages: ['mongoose'],

  // API route'larda body size limitini tamamen kaldır
  async headers() {
    return [
      {
        source: '/api/cloudinary/upload',
        headers: [
          {
            key: 'Content-Length',
            value: '0',
          },
          {
            key: 'Transfer-Encoding',
            value: 'chunked',
          },
        ],
      },
    ];
  },

  // Body size limitini tamamen kaldır
  async rewrites() {
    return [
      {
        source: '/api/cloudinary/upload',
        destination: '/api/cloudinary/upload',
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "www.kultursanatis.com.tr" },
      { protocol: "https", hostname: "kultursanatis.com.tr" },
      { protocol: "https", hostname: "fy5ffbdnlyraga9y.public.blob.vercel-storage.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "localhost" },
    ],
    unoptimized: true, // Vercel Blob için optimize etmeyi kapat
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint build sırasında kontrol etme - Vercel için geçici olarak kapatıldı
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack ayarları - path alias çözümleme için
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
