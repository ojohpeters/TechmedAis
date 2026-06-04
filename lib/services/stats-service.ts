import { prisma } from "@/lib/prisma";
import { startOfDayUTC, dayKey } from "@/lib/utils";
import type { LeaderboardEntry, HeatmapDay } from "@/types";
import type { Prisma } from "@prisma/client";

export async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { selectedSubjects: true, streak: true },
  });
  if (!user) return null;

  const sessions = await prisma.examSession.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  const totalExams = await prisma.examSession.count({ where: { userId } });
  const percentages = sessions.map((s) => s.percentage);
  const averageScore =
    percentages.length > 0
      ? Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 10) / 10
      : 0;
  const bestScore = percentages.length > 0 ? Math.max(...percentages) : 0;

  // Per-subject performance from breakdown snapshots.
  const subjectPerf = new Map<string, { name: string; total: number; correct: number; attempts: number }>();
  for (const s of sessions) {
    const breakdown = (s.breakdown as { subjectId: string; name: string; total: number; correct: number }[] | null) || [];
    for (const b of breakdown) {
      const agg = subjectPerf.get(b.subjectId) ?? { name: b.name, total: 0, correct: 0, attempts: 0 };
      agg.total += b.total;
      agg.correct += b.correct;
      agg.attempts += 1;
      subjectPerf.set(b.subjectId, agg);
    }
  }
  // Ensure every selected subject appears, even with no attempts yet.
  for (const subj of user.selectedSubjects) {
    if (!subjectPerf.has(subj.id)) subjectPerf.set(subj.id, { name: subj.name, total: 0, correct: 0, attempts: 0 });
  }

  const subjectPerformance = Array.from(subjectPerf.entries()).map(([subjectId, v]) => ({
    subjectId,
    name: v.name,
    attempts: v.attempts,
    percentage: v.total > 0 ? Math.round((v.correct / v.total) * 1000) / 10 : 0,
  }));

  // Global rank by total points.
  const higher = await prisma.user.count({ where: { totalPoints: { gt: user.totalPoints }, role: "STUDENT" } });
  const rank = higher + 1;

  return {
    user,
    stats: {
      totalExams,
      averageScore,
      bestScore,
      subjectsCount: user.selectedSubjects.length,
    },
    recentSessions: sessions.slice(0, 5),
    subjectPerformance,
    streak: user.streak,
    globalRank: rank,
  };
}

export async function getLeaderboard(
  scope: "GLOBAL" | "UNIVERSITY" | "WEEKLY" | "MONTHLY",
  currentUserId: string,
  page = 1,
  pageSize = 20
): Promise<{ entries: LeaderboardEntry[]; total: number; userRank: number | null }> {
  const me = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { university: true },
  });

  if (scope === "GLOBAL" || scope === "UNIVERSITY") {
    const where: Prisma.UserWhereInput = { role: "STUDENT", suspended: false };
    if (scope === "UNIVERSITY") where.university = me?.university ?? "__none__";

    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { streak: true },
    });

    const entries: LeaderboardEntry[] = users.map((u, i) => ({
      rank: (page - 1) * pageSize + i + 1,
      userId: u.id,
      name: u.displayName || u.name,
      displayName: u.displayName,
      avatar: u.avatar,
      university: u.university,
      points: u.totalPoints,
      streak: u.streak?.currentStreak ?? 0,
      isCurrentUser: u.id === currentUserId,
    }));

    // Compute the current user's absolute rank.
    const meRow = await prisma.user.findUnique({ where: { id: currentUserId }, select: { totalPoints: true } });
    let userRank: number | null = null;
    if (meRow) {
      const higher = await prisma.user.count({ where: { ...where, totalPoints: { gt: meRow.totalPoints } } });
      userRank = higher + 1;
    }
    return { entries, total, userRank };
  }

  // WEEKLY / MONTHLY — aggregate points from exam sessions in the window.
  const now = new Date();
  let since: Date;
  if (scope === "WEEKLY") {
    const d = startOfDayUTC(now);
    const dow = d.getUTCDay(); // 0 = Sunday
    const diff = (dow + 6) % 7; // days since Monday
    since = new Date(d.getTime() - diff * 86400000);
  } else {
    since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  const grouped = await prisma.examSession.groupBy({
    by: ["userId"],
    where: { completedAt: { gte: since } },
    _sum: { score: true },
    orderBy: { _sum: { score: "desc" } },
  });

  const total = grouped.length;
  const pageSlice = grouped.slice((page - 1) * pageSize, page * pageSize);
  const userIds = pageSlice.map((g) => g.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: { streak: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const entries: LeaderboardEntry[] = pageSlice.map((g, i) => {
    const u = userMap.get(g.userId);
    return {
      rank: (page - 1) * pageSize + i + 1,
      userId: g.userId,
      name: u?.displayName || u?.name || "Student",
      displayName: u?.displayName,
      avatar: u?.avatar,
      university: u?.university,
      points: g._sum.score ?? 0,
      streak: u?.streak?.currentStreak ?? 0,
      isCurrentUser: g.userId === currentUserId,
    };
  });

  const userIndex = grouped.findIndex((g) => g.userId === currentUserId);
  const userRank = userIndex >= 0 ? userIndex + 1 : null;

  return { entries, total, userRank };
}

export async function getHeatmap(userId: string, days = 182): Promise<HeatmapDay[]> {
  const end = startOfDayUTC(new Date());
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  const activities = await prisma.dailyActivity.findMany({
    where: { userId, date: { gte: start } },
    orderBy: { date: "asc" },
  });
  const map = new Map(activities.map((a) => [dayKey(a.date), a]));

  const result: HeatmapDay[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const key = dayKey(d);
    const a = map.get(key);
    result.push({ date: key, count: a?.examsCount ?? 0, points: a?.pointsEarned ?? 0 });
  }
  return result;
}

// Deterministic "question of the day" — stable per day, varies per user.
export async function getDailyChallenge(userId: string) {
  const count = await prisma.question.count();
  if (count === 0) return null;
  const seedStr = `${dayKey()}-${userId}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  const skip = hash % count;
  const q = await prisma.question.findFirst({
    skip,
    include: { subject: { select: { name: true, icon: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (!q) return null;
  return {
    id: q.id,
    subjectName: q.subject.name,
    subjectIcon: q.subject.icon,
    university: q.university,
    year: q.year,
    questionText: q.questionText,
    options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty,
  };
}
