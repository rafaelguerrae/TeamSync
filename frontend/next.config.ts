import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable error overlay in development
  devIndicators: {
    buildActivity: true,
  }
};

export default nextConfig;
