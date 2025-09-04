/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Handle static page generation issues
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Skip static generation for error pages during build
  async generateStaticParams() {
    return [];
  },
  // Webpack configuration to handle potential module issues
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Ensure proper module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

module.exports = nextConfig;