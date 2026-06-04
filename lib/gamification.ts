// Points, ranks, levels, grades and streak-milestone logic.

export const POINTS = {
  CORRECT: 10,
  HARD_CORRECT: 15,
  PERFECT_SCORE_BONUS: 50,
  FIRST_ATTEMPT_OF_DAY: 20,
  STREAK_DAILY_BONUS: 5,
} as const;

export interface Rank {
  key: string;
  name: string;
  emoji: string;
  min: number;
  max: number; // Infinity for the top tier
  color: string;
}

export const RANKS: Rank[] = [
  { key: "rookie", name: "Rookie", emoji: "🌱", min: 0, max: 499, color: "#16A34A" },
  { key: "rising_star", name: "Rising Star", emoji: "⭐", min: 500, max: 1499, color: "#F59E0B" },
  { key: "sharp_student", name: "Sharp Student", emoji: "🎯", min: 1500, max: 2999, color: "#0EA5E9" },
  { key: "exam_warrior", name: "Exam Warrior", emoji: "⚔️", min: 3000, max: 5999, color: "#7C3AED" },
  { key: "elite_candidate", name: "Elite Candidate", emoji: "🏆", min: 6000, max: 9999, color: "#DB2777" },
  { key: "techmed_legend", name: "TECHMED Legend", emoji: "👑", min: 10000, max: Infinity, color: "#00D4FF" },
];

export function getRank(points: number): Rank {
  return RANKS.find((r) => points >= r.min && points <= r.max) ?? RANKS[0];
}

/** Progress (0–1) toward the next rank, plus points remaining. */
export function rankProgress(points: number): {
  rank: Rank;
  next: Rank | null;
  progress: number;
  pointsToNext: number;
} {
  const rank = getRank(points);
  const idx = RANKS.findIndex((r) => r.key === rank.key);
  const next = idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
  if (!next) return { rank, next: null, progress: 1, pointsToNext: 0 };
  const span = next.min - rank.min;
  const done = points - rank.min;
  return {
    rank,
    next,
    progress: Math.min(1, done / span),
    pointsToNext: Math.max(0, next.min - points),
  };
}

export interface Grade {
  letter: "A" | "B" | "C" | "D" | "F";
  color: string;
  label: string;
}

export function getGrade(percentage: number): Grade {
  if (percentage >= 70) return { letter: "A", color: "#16A34A", label: "Excellent" };
  if (percentage >= 60) return { letter: "B", color: "#0EA5E9", label: "Very Good" };
  if (percentage >= 50) return { letter: "C", color: "#F59E0B", label: "Good" };
  if (percentage >= 45) return { letter: "D", color: "#EA580C", label: "Fair" };
  return { letter: "F", color: "#DC2626", label: "Needs Work" };
}

export function performanceMessage(percentage: number): string {
  if (percentage === 100) return "Flawless! A perfect score — you're built different. 🏆";
  if (percentage >= 80) return "Outstanding! You're exam-ready. Keep this momentum. 🚀";
  if (percentage >= 70) return "Great work! You've got a solid grip on this. 💪";
  if (percentage >= 60) return "Good job! A little more polish and you'll be unstoppable. ✨";
  if (percentage >= 50) return "You passed! Review your mistakes and push higher. 📈";
  if (percentage >= 40) return "Almost there. Focus on weak areas and retry. 🔁";
  return "Don't give up — every expert was once a beginner. Review and retake. 🌱";
}

export interface StreakMilestone {
  days: number;
  bonus: number;
  badgeKey: string;
  label: string;
  emoji: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, bonus: 30, badgeKey: "streak_3", label: "3-Day Streak", emoji: "🔥" },
  { days: 7, bonus: 70, badgeKey: "streak_7", label: "Week Warrior", emoji: "🔥" },
  { days: 14, bonus: 150, badgeKey: "streak_14", label: "Fortnight Fighter", emoji: "🔥" },
  { days: 30, bonus: 300, badgeKey: "streak_30", label: "Monthly Master", emoji: "🔥" },
  { days: 60, bonus: 600, badgeKey: "streak_60", label: "Relentless", emoji: "🔥" },
  { days: 100, bonus: 1000, badgeKey: "streak_100", label: "Centurion", emoji: "💯" },
];

export function milestoneFor(streak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.days === streak) ?? null;
}

/** One freeze token earned for every completed 7-day streak block. */
export function freezeTokensForStreak(streak: number): number {
  return Math.floor(streak / 7);
}
