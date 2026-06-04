import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResultsView } from "@/components/exam/results-view";

export const metadata = { title: "Exam Results" };
export const dynamic = "force-dynamic";

interface AnswerRecord {
  selected: "A" | "B" | "C" | "D" | null;
  correct: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  subjectId: string;
}

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const examSession = await prisma.examSession.findUnique({ where: { id: params.id } });
  if (!examSession) notFound();
  if (examSession.userId !== session.user.id && session.user.role !== "ADMIN") redirect("/dashboard");

  const answers = examSession.answers as unknown as Record<string, AnswerRecord>;
  const questions = await prisma.question.findMany({
    where: { id: { in: Object.keys(answers) } },
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

  const breakdown = (examSession.breakdown as { subjectId: string; name: string; total: number; correct: number; percentage: number }[] | null) ?? [];

  return (
    <ResultsView
      session={{
        id: examSession.id,
        mode: examSession.mode,
        totalQuestions: examSession.totalQuestions,
        correctCount: examSession.correctCount,
        wrongCount: examSession.wrongCount,
        unansweredCount: examSession.unansweredCount,
        percentage: examSession.percentage,
        pointsEarned: examSession.score,
        timeTaken: examSession.timeTaken,
      }}
      breakdown={breakdown}
      review={review}
    />
  );
}
