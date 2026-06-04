"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardRow } from "@/components/shared/leaderboard-row";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/lib/api";
import type { LeaderboardEntry } from "@/types";
import { Trophy } from "lucide-react";

type Scope = "GLOBAL" | "UNIVERSITY" | "WEEKLY" | "MONTHLY";
const SCOPES: { key: Scope; label: string }[] = [
  { key: "GLOBAL", label: "Global" },
  { key: "UNIVERSITY", label: "My Uni" },
  { key: "WEEKLY", label: "Weekly" },
  { key: "MONTHLY", label: "Monthly" },
];

export function LeaderboardClient() {
  const [scope, setScope] = React.useState<Scope>("GLOBAL");
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const pageSize = 20;

  const load = React.useCallback(async (s: Scope, p: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const data = await api.get<{ entries: LeaderboardEntry[]; total: number; userRank: number | null }>(
        `/api/leaderboard?scope=${s}&page=${p}&pageSize=${pageSize}`
      );
      setEntries((prev) => (append ? [...prev, ...data.entries] : data.entries));
      setTotal(data.total);
      setUserRank(data.userRank);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  React.useEffect(() => {
    setPage(1);
    load(scope, 1, false);
  }, [scope, load]);

  const hasMore = entries.length < total;
  const top3 = entries.slice(0, 3);

  return (
    <div className="space-y-4">
      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <TabsList className="grid w-full grid-cols-4">
          {SCOPES.map((s) => <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {userRank && (
        <Card className="bg-techmed-gradient/10">
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Your position</span>
            <span className="text-lg font-bold text-primary">#{userRank}</span>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="No rankings yet" description="Complete an exam to appear on the leaderboard." actionLabel="Start an exam" actionHref="/exam/setup" />
      ) : (
        <>
          {/* Podium */}
          {top3.length === 3 && (
            <div className="grid grid-cols-3 items-end gap-2">
              {[top3[1], top3[0], top3[2]].map((e, i) => {
                const heights = ["h-20", "h-28", "h-16"];
                const medals = ["🥈", "👑", "🥉"];
                return (
                  <div key={e.userId} className="flex flex-col items-center">
                    <span className="text-2xl">{medals[i]}</span>
                    <p className="max-w-full truncate text-xs font-semibold">{e.name}</p>
                    <p className="text-xs text-primary">{e.points.toLocaleString()}</p>
                    <div className={`mt-1 w-full rounded-t-lg bg-techmed-gradient/30 ${heights[i]}`} />
                  </div>
                );
              })}
            </div>
          )}

          <Card>
            <CardContent className="space-y-1 py-2">
              {entries.map((e) => <LeaderboardRow key={`${e.userId}-${e.rank}`} entry={e} />)}
            </CardContent>
          </Card>

          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              disabled={loadingMore}
              onClick={() => { const np = page + 1; setPage(np); load(scope, np, true); }}
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />} Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
