"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Flag, ChevronLeft, ChevronRight, Pause, Play, Grid3x3, Check, X, Loader2, Clock, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn, clock } from "@/lib/utils";
import { api } from "@/lib/api";
import { useExamStore, elapsedSeconds } from "@/store/exam-store";
import type { AnswerOption } from "@/types";

export function ExamRunner() {
  const router = useRouter();
  const store = useExamStore();
  const { questions, settings, current, answers, flagged, paused } = store;

  const [now, setNow] = React.useState(Date.now());
  const [showPalette, setShowPalette] = React.useState(false);
  const [confirmSubmit, setConfirmSubmit] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const submittingRef = React.useRef(false);

  const timed = (settings?.durationSeconds ?? 0) > 0;
  const elapsed = elapsedSeconds(store);
  const remaining = timed ? Math.max(0, (settings!.durationSeconds) - elapsed) : 0;
  const practice = settings?.mode === "PRACTICE";

  // Tick every second (skip while paused).
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [paused]);

  const doSubmit = React.useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const payload = {
        subjectIds: settings!.subjectIds,
        mode: settings!.mode,
        timeTaken: elapsedSeconds(useExamStore.getState()),
        answers: Object.fromEntries(questions.map((q) => [q.id, answers[q.id] ?? null])),
      };
      const res = await api.post<{ sessionId: string }>("/api/exam/submit", payload);
      store.reset();
      router.replace(`/exam/results/${res.sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [answers, questions, settings, store, router]);

  // Auto-submit when the timer runs out.
  React.useEffect(() => {
    if (timed && remaining <= 0 && !submittingRef.current && questions.length > 0) {
      toast.info("Time's up! Submitting your exam…");
      doSubmit();
    }
  }, [timed, remaining, doSubmit, questions.length]);

  if (!settings || questions.length === 0) {
    return null;
  }

  const q = questions[current];
  const selected = answers[q.id] ?? null;
  const answeredCount = questions.filter((qq) => answers[qq.id]).length;
  const isLast = current === questions.length - 1;
  const lowTime = timed && remaining < 120;

  function pick(option: AnswerOption) {
    if (practice && selected) return; // locked after answering in practice mode
    store.answer(q.id, option);
  }

  const OPTIONS: { key: AnswerOption; text: string }[] = [
    { key: "A", text: q.optionA },
    { key: "B", text: q.optionB },
    { key: "C", text: q.optionC },
    { key: "D", text: q.optionD },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{q.subjectIcon} {q.subjectName}</Badge>
          <span className="text-sm font-medium text-muted-foreground">Q{current + 1} / {questions.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {timed ? (
            <span className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums", lowTime ? "animate-pulse bg-red-500/15 text-red-500" : "bg-muted")}>
              <Clock className="h-4 w-4" /> {clock(remaining)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium tabular-nums">
              <Clock className="h-4 w-4" /> {clock(elapsed)}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={() => { store.setPaused(true); }} aria-label="Pause">
            <Pause className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Progress value={((current + 1) / questions.length) * 100} className="h-1 rounded-none" />

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-medium leading-relaxed">{q.questionText}</p>
            <button
              onClick={() => store.toggleFlag(q.id)}
              className={cn("shrink-0 rounded-lg p-2 transition-colors", flagged[q.id] ? "bg-amber-500/15 text-amber-500" : "text-muted-foreground hover:bg-muted")}
              aria-label="Flag question"
            >
              <Flag className="h-5 w-5" fill={flagged[q.id] ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{q.university} · {q.year} · {q.difficulty}</p>

          <div className="mt-5 grid gap-3">
            {OPTIONS.map(({ key, text }) => {
              const isPicked = selected === key;
              const revealCorrect = practice && selected && key === q.correctAnswer;
              const revealWrong = practice && isPicked && key !== q.correctAnswer;
              return (
                <button
                  key={key}
                  onClick={() => pick(key)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-all active:scale-[0.99]",
                    isPicked && !practice && "border-primary bg-primary/5 ring-1 ring-primary",
                    revealCorrect && "border-green-500 bg-green-500/10",
                    revealWrong && "border-red-500 bg-red-500/10",
                    !isPicked && !revealCorrect && "border-border hover:border-primary/40"
                  )}
                >
                  <span className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                    isPicked && !practice && "border-primary bg-primary text-primary-foreground",
                    revealCorrect && "border-green-500 bg-green-500 text-white",
                    revealWrong && "border-red-500 bg-red-500 text-white"
                  )}>
                    {revealCorrect ? <Check className="h-4 w-4" /> : revealWrong ? <X className="h-4 w-4" /> : key}
                  </span>
                  <span className="text-sm">{text}</span>
                </button>
              );
            })}
          </div>

          {practice && selected && q.explanation && (
            <div className="mt-4 rounded-xl bg-muted p-4 text-sm animate-fade-in">
              <p className="font-semibold">{selected === q.correctAnswer ? "✅ Correct!" : `❌ Correct answer: ${q.correctAnswer}`}</p>
              <p className="mt-1 text-muted-foreground">{q.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <footer className="border-t border-border px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Button variant="outline" onClick={store.prev} disabled={current === 0}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowPalette(true)} aria-label="Question palette">
            <Grid3x3 className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center text-xs text-muted-foreground">{answeredCount}/{questions.length} answered</div>
          {isLast ? (
            <Button variant="gradient" onClick={() => setConfirmSubmit(true)}>Submit</Button>
          ) : (
            <Button variant="gradient" onClick={store.next}>Next <ChevronRight className="h-4 w-4" /></Button>
          )}
        </div>
      </footer>

      {/* Palette */}
      <Dialog open={showPalette} onOpenChange={setShowPalette}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Question palette</DialogTitle>
            <DialogDescription>Tap a number to jump to that question.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
            {questions.map((qq, i) => {
              const isAnswered = !!answers[qq.id];
              const isFlagged = flagged[qq.id];
              return (
                <button
                  key={qq.id}
                  onClick={() => { store.goTo(i); setShowPalette(false); }}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold",
                    i === current && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                    isAnswered ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                  {isFlagged && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-500" />}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary" /> Answered</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-muted" /> Unanswered</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500" /> Flagged</span>
          </div>
          <DialogFooter>
            <Button variant="gradient" className="w-full" onClick={() => { setShowPalette(false); setConfirmSubmit(true); }}>Submit exam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause overlay */}
      <Dialog open={paused} onOpenChange={(o) => { if (!o) store.setPaused(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exam paused</DialogTitle>
            <DialogDescription>The timer is stopped. Resume when you're ready.</DialogDescription>
          </DialogHeader>
          <Button variant="gradient" size="lg" onClick={() => store.setPaused(false)}><Play className="h-5 w-5" /> Resume</Button>
        </DialogContent>
      </Dialog>

      {/* Confirm submit */}
      <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Submit exam?</DialogTitle>
            <DialogDescription>
              You've answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && ` ${questions.length - answeredCount} will be marked unanswered.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSubmit(false)} disabled={submitting}>Keep going</Button>
            <Button variant="gradient" onClick={doSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
