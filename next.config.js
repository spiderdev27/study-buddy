/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Remove serverActions as it's enabled by default now
  },
  // Use more direct output configuration
  distDir: '.next',
  poweredByHeader: false,
  
  // Simplified rewrites configuration
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig 