/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;