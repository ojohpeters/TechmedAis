import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma / bcrypt) — shared by middleware and the full
// auth instance. The Credentials provider is attached in `lib/auth.ts`.
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: "STUDENT" | "ADMIN" }).role ?? "STUDENT";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "STUDENT" | "ADMIN") ?? "STUDENT";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const protectedPrefixes = ["/dashboard", "/exam", "/leaderboard", "/profile", "/admin"];
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
      const isAdminRoute = pathname.startsWith("/admin");
      const isAuthPage = pathname === "/login" || pathname === "/register";

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        return (auth!.user as { role?: string }).role === "ADMIN";
      }
      if (isProtected && !isLoggedIn) return false;
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
