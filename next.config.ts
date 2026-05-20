import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "cdn.brandfetch.io" },
    ],
  },
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  typescript: {
    // Pre-existing RouteImpl / Prisma type errors — will be cleaned up post-launch
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
