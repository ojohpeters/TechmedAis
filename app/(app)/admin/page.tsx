import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { startOfDayUTC, initials } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, FileQuestion, Activity, ListChecks, Upload, PlusCircle } from "lucide-react";

export const metadata = { title: "Admin · Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const today = startOfDayUTC(new Date());
  const weekAgo = new Date(today.getTime() - 6 * 86400000);

  const [students, questions, sessions, activeToday, activeWeek, recentSessions, topStudents, subjectCounts] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.question.count(),
      prisma.examSession.count(),
      prisma.dailyActivity.count({ where: { date: today } }),
      prisma.dailyActivity.findMany({ where: { date: { gte: weekAgo } }, select: { userId: true }, distinct: ["userId"] }),
      prisma.examSession.findMany({ select: { subjectIds: true }, take: 500, orderBy: { completedAt: "desc" } }),
      prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { totalPoints: "desc" }, take: 5, select: { id: true, name: true, displayName: true, avatar: true, university: true, totalPoints: true } }),
      prisma.subject.findMany({ select: { id: true, name: true, icon: true, _count: { select: { questions: true } } }, orderBy: { name: "asc" } }),
    ]);

  const attemptMap = new Map<string, number>();
  for (const s of recentSessions) for (const id of s.subjectIds) attemptMap.set(id, (attemptMap.get(id) ?? 0) + 1);
  const subjectName = new Map(subjectCounts.map((s) => [s.id, { name: s.name, icon: s.icon }]));
  const mostAttempted = Array.from(attemptMap.entries())
    .map(([id, count]) => ({ id, ...subjectName.get(id), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total students" value={students} icon={Users} accent="#0066CC" />
        <StatCard label="Questions" value={questions} icon={FileQuestion} accent="#00D4FF" />
        <StatCard label="Exams taken" value={sessions} icon={ListChecks} accent="#7C3AED" />
        <StatCard label="Active today" value={activeToday} icon={Activity} accent="#16A34A" hint={`${activeWeek.length} this week`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="gradient"><Link href="/admin/questions"><PlusCircle className="h-4 w-4" /> Add question</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/questions/bulk"><Upload className="h-4 w-4" /> Bulk upload CSV</Link></Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Most attempted subjects</CardTitle></CardHeader>
          <CardContent>
            {mostAttempted.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exam data yet.</p>
            ) : (
              <div className="space-y-2">
                {mostAttempted.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span>{s.icon} {s.name}</span>
                    <span className="font-semibold text-muted-foreground">{s.count} sessions</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top performing students</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students yet.</p>
            ) : (
              topStudents.map((u, i) => (
                <Link key={u.id} href={`/admin/users?focus=${u.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/60">
                  <span className="w-5 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                  <Avatar className="h-8 w-8">{u.avatar ? <AvatarImage src={u.avatar} /> : null}<AvatarFallback className="text-[10px]">{initials(u.displayName || u.name)}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.displayName || u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.university ?? "—"}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{u.totalPoints.toLocaleString()}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Questions by subject</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {subjectCounts.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                <span>{s.icon} {s.name}</span>
                <span className="font-semibold">{s._count.questions}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
