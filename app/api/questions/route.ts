import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { shuffle } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import type { PublicQuestion } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/questions?subjects=a,b&count=20&difficulty=MIXED&source=ALL_YEARS&year=2022
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);

    const subjectIds = (searchParams.get("subjects") || "").split(",").filter(Boolean);
    if (subjectIds.length === 0) {
      return NextResponse.json({ error: "Select at least one subject." }, { status: 400 });
    }
    const count = Math.min(Math.max(parseInt(searchParams.get("count") || "20", 10), 1), 100);
    const difficulty = (searchParams.get("difficulty") || "MIXED").toUpperCase();
    const source = (searchParams.get("source") || "ALL_YEARS").toUpperCase();
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined;

    const where: Prisma.QuestionWhereInput = { subjectId: { in: subjectIds } };
    if (["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      where.difficulty = difficulty as Prisma.QuestionWhereInput["difficulty"];
    }
    if (source === "MY_UNIVERSITY" && user.id) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { university: true } });
      if (dbUser?.university) where.university = dbUser.university;
    }
    if (source === "SPECIFIC_YEAR" && year) {
      where.year = year;
    }

    // Pull matching IDs, shuffle, then hydrate the selected slice.
    const ids = await prisma.question.findMany({ where, select: { id: true } });
    const chosenIds = shuffle(ids.map((q) => q.id)).slice(0, count);

    const rows = await prisma.question.findMany({
      where: { id: { in: chosenIds } },
      include: { subject: { select: { name: true, icon: true } } },
    });

    const questions: PublicQuestion[] = shuffle(
      rows.map((q) => ({
        id: q.id,
        subjectId: q.subjectId,
        subjectName: q.subject.name,
        subjectIcon: q.subject.icon,
        university: q.university,
        year: q.year,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }))
    );

    return NextResponse.json({ questions, requested: count, available: ids.length });
  } catch (error) {
    return handleApiError(error);
  }
}
