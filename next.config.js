/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  images: {
    domains: ['t.me', 'cdn.telegram.org', 'localhost'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Ensure proper module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./src'),
      '@/components': path.resolve('./src/components'),
      '@/lib': path.resolve('./src/lib'),
      '@/hooks': path.resolve('./src/hooks'),
      '@/types': path.resolve('./src/types'),
    };
    
    return config;
  },
}

module.exports = nextConfig
