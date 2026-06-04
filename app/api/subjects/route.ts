import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public list of subjects with question counts — used by registration & exam setup.
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { questions: true } } },
    });
    return NextResponse.json({
      subjects: subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        icon: s.icon,
        color: s.color,
        questionCount: s._count.questions,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
