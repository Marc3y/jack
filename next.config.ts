import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.github.dev",
    "*.preview.app.github.dev",
    "*.devtunnels.ms",
    "*.use.devtunnels.ms",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
