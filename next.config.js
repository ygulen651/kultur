/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'www.kultursanatis.com.tr' },
      { protocol: 'https', hostname: 'kultursanatis.com.tr' },
    ],
    // Static görseller için gerekli ayarlar
    unoptimized: false,
    // Public klasöründeki görseller için
    domains: ['res.cloudinary.com', 'www.kultursanatis.com.tr', 'kultursanatis.com.tr'],
  },
  // Font optimizasyonu
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Static export için gerekli
  trailingSlash: false,

  // Compiler optimizasyonu
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
