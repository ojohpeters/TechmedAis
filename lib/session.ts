import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Returns the session user or throws 401. Use inside API route handlers. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new HttpError(401, "Unauthorized");
  return session.user;
}

/** Returns the session user if ADMIN or throws 401/403. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new HttpError(403, "Forbidden — admin access required");
  return user;
}

/** Full DB user for the current session (or null). */
export async function getCurrentDbUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { selectedSubjects: true, streak: true },
  });
}

/** Wraps an API handler, converting HttpError into a JSON response. */
export function handleApiError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[api]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
