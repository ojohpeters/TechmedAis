import NextAuth from "next-auth";
// Use a relative import (not the "@/" alias): middleware is compiled in a
// separate Edge pass where the path alias may not resolve, which makes Vercel
// treat the config as an unbundled external module and fail the build.
import { authConfig } from "./lib/auth.config";

// Edge middleware uses the Prisma-free config.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on everything except static assets, the service worker and API auth.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|icons|manifest.json|sw.js|workbox-.*|favicon.ico|offline|.*\\.(?:png|jpg|jpeg|svg|ico|json|js|css)).*)",
  ],
};
