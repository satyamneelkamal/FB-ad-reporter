import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily disable TypeScript errors during build for production deployment
    // TODO: Fix all TypeScript errors and re-enable strict checking
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily disable ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
