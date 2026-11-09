import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  poweredByHeader: false,
  experimental: {
    // Default 1MB is too small for a product with a few photos — up to
    // 8MB each, several per product (see storage.ts's MAX_BYTES).
    serverActions: { bodySizeLimit: "40mb" },
  },
};

export default nextConfig;
