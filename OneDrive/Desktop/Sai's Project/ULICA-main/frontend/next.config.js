/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration only
  swcMinify: true,
  poweredByHeader: false,
  
  // Disable caching in development
  generateEtags: false,
  
  // Image configuration - supports both development and production
  images: {
    remotePatterns: [
      // Development - localhost
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/**',
      },
      // Production - will be set via environment variables
      // Add your production domains here or via NEXT_PUBLIC_IMAGE_DOMAINS
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
};

module.exports = nextConfig;
