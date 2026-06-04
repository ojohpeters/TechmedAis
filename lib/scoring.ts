import { POINTS } from "./gamification";
import type { AnswerOption, Difficulty } from "@prisma/client";

export interface ScoringQuestion {
  id: string;
  subjectId: string;
  subjectName: string;
  correctAnswer: AnswerOption;
  difficulty: Difficulty;
}

export interface ScoredResult {
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  percentage: number;
  basePoints: number; // points from correct answers only (before session bonuses)
  breakdown: {
    subjectId: string;
    name: string;
    total: number;
    correct: number;
    percentage: number;
  }[];
  // normalized answer map persisted on the session
  answers: Record<
    string,
    { selected: AnswerOption | null; correct: AnswerOption; isCorrect: boolean; subjectId: string }
  >;
}

/**
 * Pure scoring. `answers` is a map of questionId → selected option (or null).
 * Awards 15 pts for a correct HARD question, 10 otherwise.
 */
export function scoreExam(
  questions: ScoringQuestion[],
  answers: Record<string, AnswerOption | null>
): ScoredResult {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let basePoints = 0;

  const bySubject = new Map<string, { name: string; total: number; correct: number }>();
  const normalized: ScoredResult["answers"] = {};

  for (const q of questions) {
    const selected = answers[q.id] ?? null;
    const isCorrect = selected !== null && selected === q.correctAnswer;

    if (selected === null) unansweredCount++;
    else if (isCorrect) {
      correctCount++;
      basePoints += q.difficulty === "HARD" ? POINTS.HARD_CORRECT : POINTS.CORRECT;
    } else {
      wrongCount++;
    }

    const agg = bySubject.get(q.subjectId) ?? { name: q.subjectName, total: 0, correct: 0 };
    agg.total++;
    if (isCorrect) agg.correct++;
    bySubject.set(q.subjectId, agg);

    normalized[q.id] = { selected, correct: q.correctAnswer, isCorrect, subjectId: q.subjectId };
  }

  const totalQuestions = questions.length;
  const percentage = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 1000) / 10;

  const breakdown = Array.from(bySubject.entries()).map(([subjectId, v]) => ({
    subjectId,
    name: v.name,
    total: v.total,
    correct: v.correct,
    percentage: v.total === 0 ? 0 : Math.round((v.correct / v.total) * 1000) / 10,
  }));

  return { correctCount, wrongCount, unansweredCount, totalQuestions, percentage, basePoints, breakdown, answers: normalized };
}
