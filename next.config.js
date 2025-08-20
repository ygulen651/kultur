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
  // Static export için gerekli
  trailingSlash: false,
};
module.exports = nextConfig;
