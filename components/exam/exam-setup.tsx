"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Clock, Layers, GraduationCap, Target, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatDuration } from "@/lib/utils";
import { api } from "@/lib/api";
import { useExamStore } from "@/store/exam-store";
import { QUESTION_COUNT_OPTIONS, SECONDS_PER_QUESTION } from "@/lib/constants";
import type { PublicQuestion, ExamMode } from "@/types";

interface SubjectLite { id: string; name: string; icon: string | null; questionCount: number }

const MODES: { key: ExamMode; title: string; desc: string }[] = [
  { key: "EXAM", title: "Exam Mode", desc: "Results shown only at the end — just like the real CBT." },
  { key: "PRACTICE", title: "Practice Mode", desc: "See the correct answer & explanation after each question." },
  { key: "ONE_SUBJECT", title: "One Subject", desc: "Drill a single subject in depth." },
  { key: "CUSTOM", title: "Custom Mix", desc: "Pick any combination of subjects and settings." },
];

export function ExamSetup({
  allSubjects,
  presetSubjectIds,
  years,
  quickStart,
  initialMode,
}: {
  allSubjects: SubjectLite[];
  presetSubjectIds: string[];
  years: number[];
  quickStart?: boolean;
  initialMode?: ExamMode;
}) {
  const router = useRouter();
  const startExam = useExamStore((s) => s.startExam);

  const [mode, setMode] = React.useState<ExamMode>(initialMode ?? "EXAM");
  const [selected, setSelected] = React.useState<string[]>(
    presetSubjectIds.length ? presetSubjectIds : allSubjects.slice(0, 1).map((s) => s.id)
  );
  const [count, setCount] = React.useState(20);
  const [customCount, setCustomCount] = React.useState("");
  const [timeMode, setTimeMode] = React.useState<"TIMED" | "UNTIMED" | "CUSTOM">("TIMED");
  const [customMinutes, setCustomMinutes] = React.useState("30");
  const [difficulty, setDifficulty] = React.useState<"MIXED" | "EASY" | "MEDIUM" | "HARD">("MIXED");
  const [source, setSource] = React.useState("ALL_YEARS");
  const [year, setYear] = React.useState<string>(years[0]?.toString() ?? "");
  const [loading, setLoading] = React.useState(false);

  // ONE_SUBJECT mode → restrict to a single subject.
  React.useEffect(() => {
    if (mode === "ONE_SUBJECT" && selected.length > 1) setSelected([selected[0]]);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveCount = customCount ? Math.min(Math.max(parseInt(customCount, 10) || 0, 5), 100) : count;
  const availableForSelection = allSubjects
    .filter((s) => selected.includes(s.id))
    .reduce((sum, s) => sum + s.questionCount, 0);

  const estSeconds =
    timeMode === "UNTIMED"
      ? 0
      : timeMode === "CUSTOM"
        ? (parseInt(customMinutes, 10) || 0) * 60
        : effectiveCount * SECONDS_PER_QUESTION[difficulty];

  function toggleSubject(id: string) {
    if (mode === "ONE_SUBJECT") {
      setSelected([id]);
      return;
    }
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function start() {
    if (selected.length === 0) {
      toast.error("Select at least one subject");
      return;
    }
    if (effectiveCount < 5) {
      toast.error("Choose at least 5 questions");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        subjects: selected.join(","),
        count: String(effectiveCount),
        difficulty,
        source,
      });
      if (source === "SPECIFIC_YEAR" && year) params.set("year", year);

      const { questions } = await api.get<{ questions: PublicQuestion[]; available: number }>(
        `/api/questions?${params.toString()}`
      );
      if (questions.length === 0) {
        toast.error("No questions match these filters. Try widening your selection.");
        setLoading(false);
        return;
      }
      if (questions.length < effectiveCount) {
        toast.info(`Only ${questions.length} questions available — starting with those.`);
      }

      const durationSeconds =
        timeMode === "UNTIMED"
          ? 0
          : timeMode === "CUSTOM"
            ? (parseInt(customMinutes, 10) || 30) * 60
            : questions.length * SECONDS_PER_QUESTION[difficulty];

      startExam(
        { mode, subjectIds: selected, timeMode, durationSeconds, difficulty, source, year: year ? parseInt(year, 10) : undefined },
        questions
      );
      router.push("/exam/play");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start exam");
      setLoading(false);
    }
  }

  // Auto-start for the dashboard "Quick Start" button.
  const quickFired = React.useRef(false);
  React.useEffect(() => {
    if (quickStart && !quickFired.current && presetSubjectIds.length > 0) {
      quickFired.current = true;
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickStart]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Set up your exam</h1>
        <p className="text-sm text-muted-foreground">Configure your session, then hit start.</p>
      </div>

      {/* Mode */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Layers className="h-4 w-4" /> Mode</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn("rounded-xl border p-3 text-left transition-all active:scale-[0.98]", mode === m.key ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40")}
            >
              <p className="text-sm font-semibold">{m.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Subjects</span>
            <span className="text-xs font-normal text-muted-foreground">{selected.length} selected · {availableForSelection} q'ns</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {allSubjects.map((s) => {
            const on = selected.includes(s.id);
            const isPreset = presetSubjectIds.includes(s.id);
            const disabled = s.questionCount === 0;
            return (
              <button
                key={s.id}
                disabled={disabled}
                onClick={() => toggleSubject(s.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
                  on ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"
                )}
              >
                <span className="text-lg">{s.icon ?? "📘"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{s.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{s.questionCount} q's{isPreset ? " · preset" : ""}</span>
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Questions */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> Questions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {QUESTION_COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => { setCount(n); setCustomCount(""); }}
                  className={cn("h-10 w-12 rounded-lg border text-sm font-semibold transition-colors", count === n && !customCount ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40")}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Label className="text-xs text-muted-foreground">Custom (5–100)</Label>
              <Input type="number" min={5} max={100} placeholder="e.g. 25" value={customCount} onChange={(e) => setCustomCount(e.target.value)} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Timer */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4" /> Timer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              {(["TIMED", "UNTIMED", "CUSTOM"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeMode(t)}
                  className={cn("flex-1 rounded-lg border py-2 text-xs font-semibold capitalize transition-colors", timeMode === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40")}
                >
                  {t.toLowerCase()}
                </button>
              ))}
            </div>
            {timeMode === "CUSTOM" && (
              <div>
                <Label className="text-xs text-muted-foreground">Minutes</Label>
                <Input type="number" min={1} max={300} value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} className="mt-1" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {timeMode === "UNTIMED" ? "No time limit — practise at your own pace." : `Estimated time: ${formatDuration(estSeconds)}`}
            </p>
          </CardContent>
        </Card>

        {/* Difficulty */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Difficulty</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {(["MIXED", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn("rounded-lg border py-2 text-sm font-semibold capitalize transition-colors", difficulty === d ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40")}
                >
                  {d.toLowerCase()}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Source */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Question source</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_YEARS">All years</SelectItem>
                <SelectItem value="SPECIFIC_YEAR">Specific year</SelectItem>
                <SelectItem value="MY_UNIVERSITY">My university only</SelectItem>
                <SelectItem value="ALL_UNIVERSITIES">All universities</SelectItem>
              </SelectContent>
            </Select>
            {source === "SPECIFIC_YEAR" && (
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start */}
      <div className="sticky bottom-24 z-10 md:bottom-4">
        <Button onClick={start} disabled={loading} size="xl" variant="gradient" className="w-full shadow-lg">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
          Start Exam · {effectiveCount} questions
        </Button>
      </div>
    </div>
  );
}
