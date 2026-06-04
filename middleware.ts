import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight Edge-safe guard. It only checks for the presence of a NextAuth
// session cookie to decide whether to bounce unauthenticated users to /login.
// The *real* authentication + role checks happen server-side in the route
// layouts (app/(app)/layout.tsx and app/(app)/admin/layout.tsx), which run on
// the Node runtime with full NextAuth + Prisma. Running NextAuth itself inside
// Edge middleware was the source of MIDDLEWARE_INVOCATION_FAILED on Vercel.
const PROTECTED_PREFIXES = ["/dashboard", "/exam", "/leaderboard", "/profile", "/admin"];

// NextAuth v5 cookie names: dev uses the unprefixed name, production (https)
// uses the __Secure- prefixed one.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  // Fallbacks for v4-style names, just in case.
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets, the service worker and API auth.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|icons|manifest.json|sw.js|workbox-.*|favicon.ico|offline|.*\\.(?:png|jpg|jpeg|svg|ico|json|js|css)).*)",
  ],
};
