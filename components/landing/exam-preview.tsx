"use client";

import { useEffect, useState } from "react";
import { Clock, Flag, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "A", text: "8.4 × 10⁻³ mol/dm³" },
  { key: "B", text: "1.2 × 10⁻² mol/dm³" },
  { key: "C", text: "2.5 × 10⁻³ mol/dm³" },
  { key: "D", text: "4.0 × 10⁻¹ mol/dm³" },
];

// Palette states for the little question grid.
const PALETTE = [
  "answered","answered","current","answered","unanswered","flagged",
  "answered","unanswered","unanswered","answered","flagged","unanswered",
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function ExamPreview() {
  const [secs, setSecs] = useState(742);
  const [selected, setSelected] = useState<string | null>(null);

  // Tick the timer, and cycle a "selection" demo so it feels alive.
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s <= 0 ? 742 : s - 1)), 1000);
    const demo = setInterval(() => {
      setSelected((prev) => (prev === "B" ? null : "B"));
    }, 2600);
    return () => {
      clearInterval(t);
      clearInterval(demo);
    };
  }, []);

  const low = secs < 120;

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Glow behind the device */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-techmed-cyan/20 blur-3xl" aria-hidden />
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-techmed-navy-light shadow-2xl shadow-black/50 ring-1 ring-white/5">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <span className="rounded-md bg-techmed-cyan/15 px-2 py-0.5 text-techmed-cyan">Chemistry</span>
            <span className="text-slate-500">Q 3 of 30</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-bold tabular-nums",
              low ? "bg-red-500/15 text-red-400" : "bg-white/5 text-white"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {fmt(secs)}
          </div>
        </div>

        {/* Question */}
        <div className="px-4 py-4">
          <p className="text-[13px] font-medium leading-relaxed text-white">
            A solution contains 0.42 g of a monobasic acid in 250 cm³. If 25 cm³ is neutralised by
            20 cm³ of 0.1 M NaOH, what is the molar concentration of the acid?
          </p>

          <div className="mt-4 space-y-2">
            {OPTIONS.map((o) => {
              const active = selected === o.key;
              return (
                <div
                  key={o.key}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[13px] transition-all duration-300",
                    active
                      ? "border-techmed-cyan bg-techmed-cyan/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                      active ? "bg-techmed-cyan text-techmed-navy" : "bg-white/5 text-slate-400"
                    )}
                  >
                    {active ? <Check className="h-3.5 w-3.5" /> : o.key}
                  </span>
                  <span>{o.text}</span>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between">
            <button className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300" disabled>
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button className="flex items-center gap-1 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs text-yellow-400" disabled>
              <Flag className="h-3.5 w-3.5" /> Flag
            </button>
            <button className="flex items-center gap-1 rounded-lg bg-techmed-gradient px-3 py-1.5 text-xs font-semibold text-white" disabled>
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Palette */}
          <div className="mt-4 grid grid-cols-6 gap-1.5">
            {PALETTE.map((state, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-7 items-center justify-center rounded-md text-[10px] font-semibold",
                  state === "answered" && "bg-techmed-blue/30 text-techmed-cyan",
                  state === "current" && "bg-techmed-cyan text-techmed-navy ring-2 ring-techmed-cyan/40",
                  state === "flagged" && "bg-yellow-400/20 text-yellow-400",
                  state === "unanswered" && "bg-white/5 text-slate-500"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
