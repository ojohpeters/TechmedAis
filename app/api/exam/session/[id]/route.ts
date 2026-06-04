import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError, HttpError } from "@/lib/session";

export const runtime = "nodejs";

interface AnswerRecord {
  selected: "A" | "B" | "C" | "D" | null;
  correct: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  subjectId: string;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const session = await prisma.examSession.findUnique({ where: { id: params.id } });
    if (!session) throw new HttpError(404, "Session not found");
    if (session.userId !== user.id && user.role !== "ADMIN") throw new HttpError(403, "Forbidden");

    const answers = session.answers as unknown as Record<string, AnswerRecord>;
    const questionIds = Object.keys(answers);

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { subject: { select: { name: true, icon: true } } },
    });

    const review = questions.map((q) => ({
      id: q.id,
      subjectName: q.subject.name,
      subjectIcon: q.subject.icon,
      questionText: q.questionText,
      options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
      correctAnswer: q.correctAnswer,
      selected: answers[q.id]?.selected ?? null,
      isCorrect: answers[q.id]?.isCorrect ?? false,
      explanation: q.explanation,
      university: q.university,
      year: q.year,
      difficulty: q.difficulty,
    }));

    return NextResponse.json({
      session: {
        id: session.id,
        mode: session.mode,
        totalQuestions: session.totalQuestions,
        correctCount: session.correctCount,
        wrongCount: session.wrongCount,
        unansweredCount: session.unansweredCount,
        percentage: session.percentage,
        score: session.score,
        timeTaken: session.timeTaken,
        breakdown: session.breakdown,
        completedAt: session.completedAt,
      },
      review,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
