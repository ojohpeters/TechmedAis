import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData, getHeatmap, getDailyChallenge, getLeaderboard } from "@/lib/services/stats-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/stat-card";
import { StreakBadge } from "@/components/shared/streak-badge";
import { RankBadge } from "@/components/shared/rank-badge";
import { Heatmap } from "@/components/dashboard/heatmap";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { LeaderboardRow } from "@/components/shared/leaderboard-row";
import { EmptyState } from "@/components/shared/empty-state";
import { rankProgress } from "@/lib/gamification";
import { getGrade } from "@/lib/gamification";
import { clock, relativeTime } from "@/lib/utils";
import { PlayCircle, Trophy, Target, Award, ListChecks, BookOpen, ChevronRight, History } from "lucide-react";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [data, heatmap, challenge, leaderboard] = await Promise.all([
    getDashboardData(userId),
    getHeatmap(userId, 119),
    getDailyChallenge(userId),
    getLeaderboard("GLOBAL", userId, 1, 5),
  ]);
  if (!data) redirect("/login");

  const { user, stats, recentSessions, subjectPerformance, streak, globalRank } = data;
  const firstName = (user.displayName || user.name).split(" ")[0];
  const rp = rankProgress(user.totalPoints);

  return (
    <div className="space-y-6">
      {/* Welcome + rank */}
      <section className="rounded-2xl bg-techmed-navy p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-300">Welcome back,</p>
            <h1 className="text-2xl font-bold">{firstName} 👋</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StreakBadge streak={streak?.currentStreak ?? 0} />
              <RankBadge points={user.totalPoints} showPoints />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-300">Global rank</p>
            <p className="text-3xl font-extrabold text-techmed-cyan">#{globalRank}</p>
          </div>
        </div>
        {rp.next && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
              <span>{rp.rank.emoji} {rp.rank.name}</span>
              <span>{rp.pointsToNext.toLocaleString()} pts to {rp.next.emoji} {rp.next.name}</span>
            </div>
            <Progress value={rp.progress * 100} className="bg-white/10" />
          </div>
        )}
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Exams taken" value={stats.totalExams} icon={ListChecks} accent="#0066CC" />
        <StatCard label="Average score" value={`${stats.averageScore}%`} icon={Target} accent="#00D4FF" />
        <StatCard label="Best score" value={`${stats.bestScore}%`} icon={Award} accent="#16A34A" />
        <StatCard label="Subjects" value={stats.subjectsCount} icon={BookOpen} accent="#7C3AED" />
      </section>

      {/* Quick start */}
      <section>
        <Card className="bg-techmed-gradient text-white">
          <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Ready to practise?</h2>
              <p className="text-sm text-white/85">Jump straight in with your {stats.subjectsCount} preset subjects.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="lg" variant="secondary">
                <Link href="/exam/setup?quick=1"><PlayCircle className="h-5 w-5" /> Quick Start</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/exam/setup">Customize</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjectPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground">Take an exam to see your subject breakdown.</p>
            ) : (
              subjectPerformance.map((s) => (
                <div key={s.subjectId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">{s.attempts === 0 ? "No attempts" : `${s.percentage}%`}</span>
                  </div>
                  <Progress value={s.percentage} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Daily challenge */}
        <DailyChallenge challenge={challenge} />
      </div>

      {/* Streak heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Activity</span>
            <span className="text-sm font-normal text-muted-foreground">
              🔥 {streak?.currentStreak ?? 0} day streak · longest {streak?.longestStreak ?? 0}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap days={heatmap} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent history */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Recent exams
              <Button asChild variant="ghost" size="sm"><Link href="/profile#history">View all <ChevronRight className="h-4 w-4" /></Link></Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <EmptyState icon={History} title="No exams yet" description="Your completed exams will show up here." actionLabel="Start your first exam" actionHref="/exam/setup" />
            ) : (
              <div className="divide-y divide-border">
                {recentSessions.map((s) => {
                  const grade = getGrade(s.percentage);
                  return (
                    <Link key={s.id} href={`/exam/results/${s.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold" style={{ backgroundColor: `${grade.color}1A`, color: grade.color }}>
                        {grade.letter}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{s.percentage}% · {s.correctCount}/{s.totalQuestions} correct</p>
                        <p className="text-xs text-muted-foreground">{relativeTime(s.completedAt)} · {clock(s.timeTaken)} · +{s.score} pts</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-techmed-cyan" /> Top students</span>
              <Button asChild variant="ghost" size="sm"><Link href="/leaderboard">Full board <ChevronRight className="h-4 w-4" /></Link></Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rankings yet — be the first!</p>
            ) : (
              <div className="space-y-1">
                {leaderboard.entries.map((e) => <LeaderboardRow key={e.userId} entry={e} compact />)}
                {leaderboard.userRank && leaderboard.userRank > 5 && (
                  <p className="pt-2 text-center text-xs text-muted-foreground">Your rank: #{leaderboard.userRank}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
