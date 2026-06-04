import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakBadge({ streak, className }: { streak: number; className?: string }) {
  const active = streak > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold",
        active ? "bg-orange-500/15 text-orange-500" : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Flame className={cn("h-4 w-4", active && "animate-pulse")} fill={active ? "currentColor" : "none"} />
      {streak} day{streak === 1 ? "" : "s"}
    </span>
  );
}
