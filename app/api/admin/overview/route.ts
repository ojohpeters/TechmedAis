import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError } from "@/lib/session";
import { startOfDayUTC } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const today = startOfDayUTC(new Date());
    const weekAgo = new Date(today.getTime() - 6 * 86400000);

    const [
      totalStudents,
      totalAdmins,
      totalQuestions,
      totalSessions,
      activeToday,
      activeWeek,
      subjectAttempts,
      topStudents,
      subjectCounts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.question.count(),
      prisma.examSession.count(),
      prisma.dailyActivity.count({ where: { date: today } }),
      prisma.dailyActivity.findMany({ where: { date: { gte: weekAgo } }, select: { userId: true }, distinct: ["userId"] }),
      prisma.examSession.findMany({ select: { subjectIds: true }, take: 1000, orderBy: { completedAt: "desc" } }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { totalPoints: "desc" },
        take: 5,
        select: { id: true, name: true, displayName: true, avatar: true, university: true, totalPoints: true },
      }),
      prisma.subject.findMany({ select: { id: true, name: true, icon: true, _count: { select: { questions: true } } } }),
    ]);

    // Most-attempted subjects (from recent sessions' subjectIds arrays).
    const attemptMap = new Map<string, number>();
    for (const s of subjectAttempts) for (const id of s.subjectIds) attemptMap.set(id, (attemptMap.get(id) ?? 0) + 1);
    const subjectName = new Map(subjectCounts.map((s) => [s.id, s.name]));
    const mostAttempted = Array.from(attemptMap.entries())
      .map(([id, count]) => ({ id, name: subjectName.get(id) ?? "Unknown", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return NextResponse.json({
      totals: { students: totalStudents, admins: totalAdmins, questions: totalQuestions, sessions: totalSessions },
      active: { today: activeToday, week: activeWeek.length },
      mostAttempted,
      topStudents,
      questionsBySubject: subjectCounts.map((s) => ({ id: s.id, name: s.name, icon: s.icon, count: s._count.questions })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
