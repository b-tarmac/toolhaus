import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@portfolio/tool-sdk",
    "@portfolio/auth",
    "@portfolio/billing",
    "@portfolio/database",
    "@portfolio/email",
    "@portfolio/seo",
    "@portfolio/usage",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
