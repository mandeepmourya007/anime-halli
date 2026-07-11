import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project, avoiding an incorrect guess (and a
  // build-time warning) when a lockfile happens to exist in a parent directory.
  turbopack: {
    root: __dirname,
  },
  // Produces a minimal, self-contained server bundle (only the deps actually
  // used) under .next/standalone — what the Dockerfile copies into the image.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
};

export default nextConfig;
