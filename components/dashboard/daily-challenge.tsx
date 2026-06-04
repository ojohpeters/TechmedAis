"use client";

import * as React from "react";
import { Sparkles, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnswerOption } from "@/types";

interface Challenge {
  id: string;
  subjectName: string;
  subjectIcon?: string | null;
  university: string;
  year: number;
  questionText: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  correctAnswer: AnswerOption;
  explanation?: string | null;
  difficulty: string;
}

export function DailyChallenge({ challenge }: { challenge: Challenge | null }) {
  const [selected, setSelected] = React.useState<AnswerOption | null>(null);
  const answered = selected !== null;

  if (!challenge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-techmed-cyan" /> Daily Challenge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No questions are available yet. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-techmed-gradient/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-techmed-cyan" /> Daily Challenge
          </CardTitle>
          <Badge variant="secondary">{challenge.subjectIcon} {challenge.subjectName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{challenge.university} · {challenge.year} · {challenge.difficulty}</p>
        <p className="mt-2 font-medium">{challenge.questionText}</p>
        <div className="mt-3 grid gap-2">
          {(["A", "B", "C", "D"] as const).map((key) => {
            const isCorrect = key === challenge.correctAnswer;
            const isPicked = key === selected;
            return (
              <button
                key={key}
                disabled={answered}
                onClick={() => setSelected(key)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                  !answered && "hover:border-primary/50",
                  answered && isCorrect && "border-green-500 bg-green-500/10",
                  answered && isPicked && !isCorrect && "border-red-500 bg-red-500/10",
                  answered && !isCorrect && !isPicked && "opacity-60"
                )}
              >
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold", answered && isCorrect && "border-green-500 text-green-500", answered && isPicked && !isCorrect && "border-red-500 text-red-500")}>
                  {answered && isCorrect ? <Check className="h-3.5 w-3.5" /> : answered && isPicked ? <X className="h-3.5 w-3.5" /> : key}
                </span>
                <span>{challenge.options[key]}</span>
              </button>
            );
          })}
        </div>
        {answered && challenge.explanation && (
          <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
            <span className="font-semibold">Explanation: </span>
            {challenge.explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
