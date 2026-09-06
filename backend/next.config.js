/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone for optimal Vercel deployment
  output: undefined, // Vercel handles this automatically

  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },

  // API-only: disable powered-by header for security
  poweredByHeader: false,

  // No frontend pages — skip React strict mode overhead
  reactStrictMode: false,

  // Disable image optimization since this is API-only
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
