import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getHeatmap } from "@/lib/services/stats-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RankBadge } from "@/components/shared/rank-badge";
import { StreakBadge } from "@/components/shared/streak-badge";
import { Heatmap } from "@/components/dashboard/heatmap";
import { HistoryList } from "@/components/profile/history-list";
import { NotificationToggle } from "@/components/profile/notification-toggle";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { initials } from "@/lib/utils";
import { rankProgress, RANKS } from "@/lib/gamification";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, allSubjects, heatmap, sessionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { selectedSubjects: { orderBy: { name: "asc" } }, streak: true, badges: { orderBy: { earnedAt: "desc" } } },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, icon: true } }),
    getHeatmap(session.user.id, 119),
    prisma.examSession.count({ where: { userId: session.user.id } }),
  ]);
  if (!user) redirect("/login");

  const rp = rankProgress(user.totalPoints);
  const freezeTokens = user.streak?.freezeTokens ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar className="h-20 w-20 ring-2 ring-techmed-cyan/40">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback className="text-2xl">{initials(user.displayName || user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.displayName || user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{user.course ? `${user.course} · ` : ""}{user.university ?? "—"}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <RankBadge points={user.totalPoints} showPoints />
              <StreakBadge streak={user.streak?.currentStreak ?? 0} />
              {freezeTokens > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-3 py-1 text-sm font-semibold text-sky-500">❄️ {freezeTokens} freeze</span>
              )}
            </div>
          </div>
          <EditProfileDialog
            initial={{
              name: user.name,
              displayName: user.displayName ?? "",
              phone: user.phone ?? "",
              university: user.university ?? "",
              faculty: user.faculty ?? "",
              course: user.course ?? "",
              avatar: user.avatar ?? "",
            }}
            allSubjects={allSubjects}
            selectedSubjectIds={user.selectedSubjects.map((s) => s.id)}
          />
        </CardContent>
      </Card>

      {/* Rank progress */}
      <Card>
        <CardHeader><CardTitle className="text-base">Rank progress</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">{rp.rank.emoji} {rp.rank.name}</span>
            <span className="text-muted-foreground">{rp.next ? `${rp.pointsToNext.toLocaleString()} pts to ${rp.next.name}` : "Max rank!"}</span>
          </div>
          <Progress value={rp.progress * 100} />
          <div className="mt-4 flex flex-wrap gap-2">
            {RANKS.map((r) => (
              <span key={r.key} className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: user.totalPoints >= r.min ? `${r.color}22` : "transparent", color: user.totalPoints >= r.min ? r.color : "hsl(var(--muted-foreground))", border: `1px solid ${user.totalPoints >= r.min ? r.color + "55" : "hsl(var(--border))"}` }}>
                {r.emoji} {r.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader><CardTitle className="text-base">Badges ({user.badges.length})</CardTitle></CardHeader>
        <CardContent>
          {user.badges.length === 0 ? (
            <p className="text-sm text-muted-foreground">Earn badges by hitting streak milestones and scoring 100%.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {user.badges.map((b) => (
                <div key={b.id} className="flex flex-col items-center rounded-xl border border-border bg-card p-3 text-center" style={{ minWidth: 84 }}>
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="mt-1 text-xs font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <NotificationToggle />

      {/* Activity heatmap */}
      <Card>
        <CardHeader><CardTitle className="text-base">Activity heatmap</CardTitle></CardHeader>
        <CardContent><Heatmap days={heatmap} /></CardContent>
      </Card>

      {/* History */}
      <div id="history" className="scroll-mt-20">
        <h2 className="mb-3 text-lg font-bold">Exam history ({sessionCount})</h2>
        <HistoryList />
      </div>
    </div>
  );
}
