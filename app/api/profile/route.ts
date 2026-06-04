import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { updateProfileSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await requireUser();
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        selectedSubjects: { orderBy: { name: "asc" } },
        streak: true,
        badges: { orderBy: { earnedAt: "desc" } },
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { password: _pw, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const sessionUser = await requireUser();
    const json = await req.json();
    const parsed = updateProfileSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
    }
    const { subjectIds, ...rest } = parsed.data;

    if (subjectIds) {
      const subjects = await prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true } });
      if (subjects.length !== subjectIds.length) {
        return NextResponse.json({ error: "Invalid subject selection." }, { status: 400 });
      }
    }

    const user = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...rest,
        displayName: rest.displayName === "" ? null : rest.displayName,
        avatar: rest.avatar === "" ? null : rest.avatar,
        ...(subjectIds ? { selectedSubjects: { set: subjectIds.map((id) => ({ id })) } } : {}),
      },
      include: { selectedSubjects: true },
    });
    const { password: _pw, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe });
  } catch (error) {
    return handleApiError(error);
  }
}
