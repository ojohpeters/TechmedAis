"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Loader2, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getGrade } from "@/lib/gamification";
import { clock, relativeTime } from "@/lib/utils";
import { api } from "@/lib/api";

interface SessionRow {
  id: string;
  mode: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  score: number;
  timeTaken: number;
  completedAt: string;
}

export function HistoryList() {
  const [sessions, setSessions] = React.useState<SessionRow[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const load = React.useCallback(async (p: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const data = await api.get<{ sessions: SessionRow[]; hasMore: boolean }>(`/api/history?page=${p}&pageSize=10`);
      setSessions((prev) => (append ? [...prev, ...data.sessions] : data.sessions));
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  React.useEffect(() => { load(1, false); }, [load]);

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>;
  }
  if (sessions.length === 0) {
    return <EmptyState icon={History} title="No exam history yet" description="Take your first exam to start tracking progress." actionLabel="Start an exam" actionHref="/exam/setup" />;
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="divide-y divide-border py-1">
          {sessions.map((s) => {
            const grade = getGrade(s.percentage);
            return (
              <Link key={s.id} href={`/exam/results/${s.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold" style={{ backgroundColor: `${grade.color}1A`, color: grade.color }}>{grade.letter}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.percentage}% · {s.correctCount}/{s.totalQuestions} · {s.mode.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{relativeTime(s.completedAt)} · {clock(s.timeTaken)} · +{s.score} pts</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
        </CardContent>
      </Card>
      {hasMore && (
        <Button variant="outline" className="w-full" disabled={loadingMore} onClick={() => { const np = page + 1; setPage(np); load(np, true); }}>
          {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />} Load more
        </Button>
      )}
    </div>
  );
}
