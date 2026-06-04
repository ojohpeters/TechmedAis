"use client";

import * as React from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Check, X, Minus, Clock, Share2, RotateCcw, PlusCircle, ListChecks, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/brand/logo";
import { cn, clock } from "@/lib/utils";
import { getGrade, performanceMessage } from "@/lib/gamification";
import type { AnswerOption } from "@/types";

interface ReviewItem {
  id: string;
  subjectName: string;
  subjectIcon?: string | null;
  questionText: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  correctAnswer: AnswerOption;
  selected: AnswerOption | null;
  isCorrect: boolean;
  explanation?: string | null;
  university: string;
  year: number;
  difficulty: string;
}

interface SessionData {
  id: string;
  mode: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
  pointsEarned: number;
  timeTaken: number;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased * 10) / 10);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function ResultsView({
  session,
  breakdown,
  review,
}: {
  session: SessionData;
  breakdown: { subjectId: string; name: string; total: number; correct: number; percentage: number }[];
  review: ReviewItem[];
}) {
  const grade = getGrade(session.percentage);
  const animated = useCountUp(session.percentage);
  const shareRef = React.useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = React.useState(false);

  async function share() {
    if (!shareRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(shareRef.current, { pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "techmed-score.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My TECHMED score", text: `I scored ${session.percentage}% on TECHMED AIS! Think Smart. Perform Elite.` });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "techmed-score.png";
        a.click();
        toast.success("Score card downloaded");
      }
    } catch {
      toast.error("Could not generate share image");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Hero / share card */}
      <div ref={shareRef} className="overflow-hidden rounded-2xl bg-techmed-navy p-6 text-white">
        <div className="flex items-center justify-between">
          <Logo size={32} withWordmark variant="light" />
          <Badge variant="gradient">{session.mode.replace("_", " ")}</Badge>
        </div>
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke={grade.color} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - animated / 100)}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold">{animated}%</span>
              <span className="text-xs text-slate-300">{session.correctCount}/{session.totalQuestions}</span>
            </div>
          </div>
          <div className="mt-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-extrabold" style={{ backgroundColor: `${grade.color}22`, color: grade.color }}>
            {grade.letter}
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-200">{performanceMessage(session.percentage)}</p>
          <p className="mt-3 text-lg font-bold text-techmed-cyan">+{session.pointsEarned} points</p>
        </div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-3 gap-3">
        <CountCard icon={Check} label="Correct" value={session.correctCount} color="#16A34A" />
        <CountCard icon={X} label="Wrong" value={session.wrongCount} color="#DC2626" />
        <CountCard icon={Minus} label="Skipped" value={session.unansweredCount} color="#64748B" />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Time taken</span>
          <span className="font-bold tabular-nums">{clock(session.timeTaken)}</span>
        </CardContent>
      </Card>

      {/* Tabs: breakdown + review */}
      <Tabs defaultValue="breakdown">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="breakdown">Subject breakdown</TabsTrigger>
          <TabsTrigger value="review"><ListChecks className="mr-1.5 h-4 w-4" /> Review answers</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader><CardTitle className="text-base">Per-subject performance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {breakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No breakdown available.</p>
              ) : (
                breakdown.map((b) => (
                  <div key={b.subjectId}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{b.name}</span>
                      <span className="text-muted-foreground">{b.correct}/{b.total} · {b.percentage}%</span>
                    </div>
                    <Progress value={b.percentage} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <div className="space-y-3">
            {review.map((item, idx) => (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">
                      <span className="text-muted-foreground">Q{idx + 1}.</span> {item.questionText}
                    </p>
                    <Badge variant={item.isCorrect ? "success" : item.selected ? "destructive" : "secondary"}>
                      {item.isCorrect ? "Correct" : item.selected ? "Wrong" : "Skipped"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.subjectIcon} {item.subjectName} · {item.university} · {item.year}</p>
                  <div className="mt-3 grid gap-2">
                    {(["A", "B", "C", "D"] as const).map((key) => {
                      const isCorrect = key === item.correctAnswer;
                      const isPicked = key === item.selected;
                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg border p-2.5 text-sm",
                            isCorrect && "border-green-500 bg-green-500/10",
                            isPicked && !isCorrect && "border-red-500 bg-red-500/10",
                            !isCorrect && !isPicked && "border-border"
                          )}
                        >
                          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold", isCorrect && "border-green-500 text-green-500", isPicked && !isCorrect && "border-red-500 text-red-500")}>
                            {isCorrect ? <Check className="h-3.5 w-3.5" /> : isPicked ? <X className="h-3.5 w-3.5" /> : key}
                          </span>
                          <span>{item.options[key]}</span>
                        </div>
                      );
                    })}
                  </div>
                  {item.explanation && (
                    <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                      <span className="font-semibold">Explanation: </span>{item.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="sticky bottom-24 z-10 grid grid-cols-2 gap-3 md:bottom-4 md:grid-cols-4">
        <Button onClick={share} variant="outline" disabled={sharing} className="col-span-2 md:col-span-1">
          {sharing ? <Download className="h-4 w-4 animate-pulse" /> : <Share2 className="h-4 w-4" />} Share
        </Button>
        <Button asChild variant="outline">
          <Link href="/exam/setup"><RotateCcw className="h-4 w-4" /> Retake</Link>
        </Button>
        <Button asChild variant="gradient" className="col-span-2 md:col-span-2">
          <Link href="/exam/setup"><PlusCircle className="h-4 w-4" /> New exam</Link>
        </Button>
      </div>
    </div>
  );
}

function CountCard({ icon: Icon, label, value, color }: { icon: typeof Check; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1A`, color }}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="mt-2 text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}
