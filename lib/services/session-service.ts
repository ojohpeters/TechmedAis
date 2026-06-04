import { prisma } from "@/lib/prisma";
import { startOfDayUTC, daysBetween } from "@/lib/utils";
import { POINTS, milestoneFor } from "@/lib/gamification";
import type { ScoredResult } from "@/lib/scoring";
import type { ExamMode } from "@prisma/client";

export interface PersistExamInput {
  userId: string;
  mode: ExamMode;
  subjectIds: string[];
  timeTaken: number;
  result: ScoredResult;
}

export interface PointsBreakdown {
  base: number;
  firstAttemptOfDay: number;
  streakDailyBonus: number;
  perfectScore: number;
  milestoneBonus: number;
  total: number;
}

export interface PersistExamOutput {
  sessionId: string;
  pointsEarned: number;
  pointsBreakdown: PointsBreakdown;
  newTotalPoints: number;
  currentStreak: number;
  longestStreak: number;
  streakIncreased: boolean;
  freezeUsed: boolean;
  newBadges: { key: string; label: string; emoji: string }[];
  milestoneReached: { days: number; label: string; emoji: string } | null;
}

/**
 * Persists a completed exam and applies all gamification side effects
 * (points, streak, daily activity heatmap, badges) atomically.
 */
export async function persistExam(input: PersistExamInput): Promise<PersistExamOutput> {
  const { userId, mode, subjectIds, timeTaken, result } = input;
  const now = new Date();
  const today = startOfDayUTC(now);

  return prisma.$transaction(async (tx) => {
    // ── Daily activity (is this the first exam today?) ──
    const existingToday = await tx.dailyActivity.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    const firstAttemptOfDay = !existingToday || existingToday.examsCount === 0;

    // ── Streak ──
    let streak = await tx.streak.findUnique({ where: { userId } });
    if (!streak) {
      streak = await tx.streak.create({
        data: { userId, currentStreak: 0, longestStreak: 0, freezeTokens: 0 },
      });
    }

    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;
    let freezeTokens = streak.freezeTokens;
    let streakIncreased = false;
    let freezeUsed = false;

    if (firstAttemptOfDay) {
      if (!streak.lastActiveDate) {
        currentStreak = 1;
        streakIncreased = true;
      } else {
        const gap = daysBetween(streak.lastActiveDate, today);
        if (gap === 0) {
          // already active today (defensive) — no change
        } else if (gap === 1) {
          currentStreak += 1;
          streakIncreased = true;
        } else if (gap === 2 && freezeTokens > 0) {
          // freeze protects a single missed day
          freezeTokens -= 1;
          freezeUsed = true;
          currentStreak += 1;
          streakIncreased = true;
        } else {
          currentStreak = 1;
          streakIncreased = true;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      // Award a freeze token each time a fresh 7-day block completes.
      if (streakIncreased && currentStreak % 7 === 0) freezeTokens += 1;
    }

    // ── Points ──
    const isPerfect = result.totalQuestions > 0 && result.percentage === 100;
    const milestone = streakIncreased ? milestoneFor(currentStreak) : null;

    const pointsBreakdown: PointsBreakdown = {
      base: result.basePoints,
      firstAttemptOfDay: firstAttemptOfDay ? POINTS.FIRST_ATTEMPT_OF_DAY : 0,
      streakDailyBonus: streakIncreased ? POINTS.STREAK_DAILY_BONUS : 0,
      perfectScore: isPerfect ? POINTS.PERFECT_SCORE_BONUS : 0,
      milestoneBonus: milestone ? milestone.bonus : 0,
      total: 0,
    };
    pointsBreakdown.total =
      pointsBreakdown.base +
      pointsBreakdown.firstAttemptOfDay +
      pointsBreakdown.streakDailyBonus +
      pointsBreakdown.perfectScore +
      pointsBreakdown.milestoneBonus;

    // ── Persist exam session ──
    const session = await tx.examSession.create({
      data: {
        userId,
        mode,
        subjectIds,
        totalQuestions: result.totalQuestions,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        unansweredCount: result.unansweredCount,
        score: pointsBreakdown.total,
        percentage: result.percentage,
        timeTaken,
        answers: result.answers as object,
        breakdown: result.breakdown as object,
      },
    });

    // ── Update streak record ──
    await tx.streak.update({
      where: { userId },
      data: { currentStreak, longestStreak, freezeTokens, lastActiveDate: today },
    });

    // ── Update user points & activity ──
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: pointsBreakdown.total },
        lastActiveDate: now,
      },
      select: { totalPoints: true },
    });

    // ── Daily activity upsert (heatmap) ──
    await tx.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        examsCount: 1,
        questionsAnswered: result.totalQuestions,
        pointsEarned: pointsBreakdown.total,
      },
      update: {
        examsCount: { increment: 1 },
        questionsAnswered: { increment: result.totalQuestions },
        pointsEarned: { increment: pointsBreakdown.total },
      },
    });

    // ── Badges ──
    const newBadges: { key: string; label: string; emoji: string }[] = [];
    const candidateBadges: { key: string; label: string; emoji: string }[] = [];
    if (milestone) candidateBadges.push({ key: milestone.badgeKey, label: milestone.label, emoji: milestone.emoji });
    if (isPerfect) candidateBadges.push({ key: "perfect_score", label: "Perfect Score", emoji: "💯" });

    for (const b of candidateBadges) {
      const existing = await tx.userBadge.findUnique({
        where: { userId_key: { userId, key: b.key } },
      });
      if (!existing) {
        await tx.userBadge.create({ data: { userId, ...b } });
        newBadges.push(b);
      }
    }

    return {
      sessionId: session.id,
      pointsEarned: pointsBreakdown.total,
      pointsBreakdown,
      newTotalPoints: user.totalPoints,
      currentStreak,
      longestStreak,
      streakIncreased,
      freezeUsed,
      newBadges,
      milestoneReached: milestone ? { days: milestone.days, label: milestone.label, emoji: milestone.emoji } : null,
    };
  });
}
