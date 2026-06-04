import { getRank } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export function RankBadge({
  points,
  className,
  showPoints = false,
  size = "md",
}: {
  points: number;
  className?: string;
  showPoints?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const rank = getRank(points);
  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };
  return (
    <span
      className={cn("inline-flex items-center rounded-full font-semibold", sizes[size], className)}
      style={{ backgroundColor: `${rank.color}22`, color: rank.color, border: `1px solid ${rank.color}55` }}
    >
      <span>{rank.emoji}</span>
      <span>{rank.name}</span>
      {showPoints && <span className="opacity-70">· {points.toLocaleString()} pts</span>}
    </span>
  );
}
