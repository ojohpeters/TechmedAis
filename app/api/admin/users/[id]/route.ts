import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError, HttpError } from "@/lib/session";
import { userUpdateSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        selectedSubjects: true,
        streak: true,
        badges: true,
        examSessions: { orderBy: { completedAt: "desc" }, take: 20 },
        _count: { select: { examSessions: true } },
      },
    });
    if (!user) throw new HttpError(404, "User not found");
    const { password: _pw, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const json = await req.json();
    const parsed = userUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    // Prevent an admin from suspending or demoting themselves.
    if (admin.id === params.id && (parsed.data.suspended || parsed.data.role === "STUDENT")) {
      throw new HttpError(400, "You cannot suspend or demote your own account.");
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data: parsed.data,
      select: { id: true, role: true, suspended: true },
    });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return handleApiError(error);
  }
}
