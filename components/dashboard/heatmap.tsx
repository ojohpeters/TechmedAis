"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { HeatmapDay } from "@/types";

function level(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

const COLORS = [
  "bg-muted",
  "bg-techmed-cyan/30",
  "bg-techmed-cyan/55",
  "bg-techmed-cyan/80",
  "bg-techmed-cyan",
];

export function Heatmap({ days }: { days: HeatmapDay[] }) {
  // Group into weeks (columns). Pad the start so the first column aligns to a weekday row.
  const weeks: HeatmapDay[][] = [];
  let current: HeatmapDay[] = [];
  days.forEach((d, i) => {
    current.push(d);
    if (current.length === 7 || i === days.length - 1) {
      weeks.push(current);
      current = [];
    }
  });

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div
                    className={cn("h-3 w-3 rounded-sm", COLORS[level(day.count)])}
                    aria-label={`${day.count} exams on ${day.date}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{day.count} exam{day.count === 1 ? "" : "s"} · {day.points} pts</p>
                  <p className="opacity-70">{new Date(day.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {COLORS.map((c, i) => (
          <span key={i} className={cn("h-3 w-3 rounded-sm", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
