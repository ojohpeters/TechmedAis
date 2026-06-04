import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";
import { Flame } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

const CROWNS: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };

export function LeaderboardRow({ entry, compact = false }: { entry: LeaderboardEntry; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
        entry.isCurrentUser ? "bg-techmed-gradient/10 ring-1 ring-techmed-cyan/40" : "hover:bg-muted/60"
      )}
    >
      <div className="flex w-7 shrink-0 items-center justify-center text-sm font-bold">
        {CROWNS[entry.rank] ? <span className="text-lg">{CROWNS[entry.rank]}</span> : <span className="text-muted-foreground">{entry.rank}</span>}
      </div>
      <Avatar className="h-8 w-8">
        {entry.avatar ? <AvatarImage src={entry.avatar} alt={entry.name} /> : null}
        <AvatarFallback className="text-[10px]">{initials(entry.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {entry.name}
          {entry.isCurrentUser && <span className="ml-1.5 text-xs font-normal text-techmed-cyan">(You)</span>}
        </p>
        {!compact && <p className="truncate text-xs text-muted-foreground">{entry.university ?? "—"}</p>}
      </div>
      {entry.streak > 0 && (
        <span className="hidden items-center gap-0.5 text-xs text-orange-500 sm:flex">
          <Flame className="h-3 w-3" /> {entry.streak}
        </span>
      )}
      <span className="shrink-0 text-sm font-bold text-primary">{entry.points.toLocaleString()}</span>
    </div>
  );
}
