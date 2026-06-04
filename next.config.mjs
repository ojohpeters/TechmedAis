import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-storage",
        expiration: { maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/questions.*/i,
      handler: "NetworkFirst",
      method: "GET",
      options: {
        cacheName: "questions-cache",
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "static-resources" },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "@prisma/client"],
  },
};

// ISOLATION TEST: bypassing next-pwa to confirm it's corrupting the Edge
// middleware bundle (MIDDLEWARE_INVOCATION_FAILED). Will restore via a
// maintained PWA plugin once confirmed.
export default nextConfig;
void withPWA;
