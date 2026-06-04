import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge middleware uses the Prisma-free config.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on everything except static assets, the service worker and API auth.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|icons|manifest.json|sw.js|workbox-.*|favicon.ico|offline|.*\\.(?:png|jpg|jpeg|svg|ico|json|js|css)).*)",
  ],
};
