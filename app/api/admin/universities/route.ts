import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError } from "@/lib/session";
import { NIGERIAN_UNIVERSITIES } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Universities are stored as free-text on users/questions. This endpoint
// surfaces the curated catalogue alongside live usage counts so admins can
// see which institutions have students and questions.
export async function GET() {
  try {
    await requireAdmin();

    const [byUserRaw, byQuestionRaw] = await Promise.all([
      prisma.user.groupBy({ by: ["university"], _count: { _all: true }, where: { university: { not: null } } }),
      prisma.question.groupBy({ by: ["university"], _count: { _all: true } }),
    ]);

    const userCounts = new Map(byUserRaw.map((r) => [r.university!, r._count._all]));
    const questionCounts = new Map(byQuestionRaw.map((r) => [r.university, r._count._all]));

    const names = new Set<string>([...NIGERIAN_UNIVERSITIES, ...userCounts.keys(), ...questionCounts.keys()]);
    const universities = Array.from(names)
      .filter((n) => n && n !== "Other")
      .sort()
      .map((name) => ({
        name,
        students: userCounts.get(name) ?? 0,
        questions: questionCounts.get(name) ?? 0,
        curated: NIGERIAN_UNIVERSITIES.includes(name),
      }));

    return NextResponse.json({ universities });
  } catch (error) {
    return handleApiError(error);
  }
}
