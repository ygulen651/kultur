/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    // Static görseller için gerekli ayarlar
    unoptimized: false,
    // Public klasöründeki görseller için
    domains: [],
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
