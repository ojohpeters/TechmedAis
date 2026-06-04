import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { submitExamSchema } from "@/lib/validations";
import { scoreExam, type ScoringQuestion } from "@/lib/scoring";
import { persistExam } from "@/lib/services/session-service";
import type { AnswerOption } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const json = await req.json();
    const parsed = submitExamSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { answers, mode, subjectIds, timeTaken } = parsed.data;

    const questionIds = Object.keys(answers);
    if (questionIds.length === 0) {
      return NextResponse.json({ error: "No answers submitted." }, { status: 400 });
    }

    // Re-fetch questions server-side — never trust client-provided correct answers.
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { subject: { select: { name: true } } },
    });

    const scoringQuestions: ScoringQuestion[] = dbQuestions.map((q) => ({
      id: q.id,
      subjectId: q.subjectId,
      subjectName: q.subject.name,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
    }));

    const cleanAnswers: Record<string, AnswerOption | null> = {};
    for (const q of dbQuestions) cleanAnswers[q.id] = answers[q.id] ?? null;

    const result = scoreExam(scoringQuestions, cleanAnswers);

    const outcome = await persistExam({
      userId: user.id,
      mode,
      subjectIds,
      timeTaken,
      result,
    });

    return NextResponse.json({
      ok: true,
      sessionId: outcome.sessionId,
      result: {
        totalQuestions: result.totalQuestions,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        unansweredCount: result.unansweredCount,
        percentage: result.percentage,
        breakdown: result.breakdown,
      },
      points: outcome.pointsBreakdown,
      pointsEarned: outcome.pointsEarned,
      newTotalPoints: outcome.newTotalPoints,
      streak: {
        current: outcome.currentStreak,
        longest: outcome.longestStreak,
        increased: outcome.streakIncreased,
        freezeUsed: outcome.freezeUsed,
      },
      newBadges: outcome.newBadges,
      milestoneReached: outcome.milestoneReached,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
