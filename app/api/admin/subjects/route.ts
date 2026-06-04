import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError } from "@/lib/session";
import { subjectAdminSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { questions: true, users: true } } },
    });
    return NextResponse.json({ subjects });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const json = await req.json();
    const parsed = subjectAdminSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
    }
    const subject = await prisma.subject.create({ data: parsed.data });
    return NextResponse.json({ ok: true, subject }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
