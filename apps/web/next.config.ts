import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@toolhaus/tool-sdk"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
