import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      http: false,
      https: false,
      net: false,
    };
    return config;
  },

  serverExternalPackages: ["googleapis", "https-proxy-agent"],
  missingSuspenseWithCSRBailout: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**", // Match all paths under lh3.googleusercontent.com
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**", // Match all paths under utfs.io
      },
    ],
  },
  async headers() {
    return [
      {
        source: `/api/feeds/parse`,
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://adam-gordon.info",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
