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
  // Disable static optimization for problematic pages
  output: 'standalone',
  // Handle build issues with error pages
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Webpack configuration to handle potential module issues
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Handle any webpack-specific issues
    return config;
  },
};

module.exports = nextConfig;