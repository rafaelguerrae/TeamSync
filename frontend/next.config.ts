import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Disable error overlay in development
  devIndicators: {
    buildActivity: true,
  }
};

export default nextConfig;
