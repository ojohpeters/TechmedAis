import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError } from "@/lib/session";
import { bulkUploadSchema } from "@/lib/validations";

export const runtime = "nodejs";

// Accepts already-validated questions (subject resolved to subjectId client-side
// against /api/subjects). Inserts them in a single batch.
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const json = await req.json();
    const parsed = bulkUploadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
    }
    const { questions } = parsed.data;

    // Verify all referenced subjects exist.
    const subjectIds = Array.from(new Set(questions.map((q) => q.subjectId)));
    const existing = await prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true } });
    const validIds = new Set(existing.map((s) => s.id));
    const invalid = questions.filter((q) => !validIds.has(q.subjectId));
    if (invalid.length > 0) {
      return NextResponse.json({ error: `${invalid.length} rows reference unknown subjects.` }, { status: 400 });
    }

    const created = await prisma.question.createMany({
      data: questions.map((q) => ({
        subjectId: q.subjectId,
        university: q.university,
        year: q.year,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        difficulty: q.difficulty,
      })),
    });

    return NextResponse.json({ ok: true, inserted: created.count });
  } catch (error) {
    return handleApiError(error);
  }
}
