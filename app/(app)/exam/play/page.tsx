"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/exam-store";
import { ExamRunner } from "@/components/exam/exam-runner";
import { Loader2 } from "lucide-react";

export default function ExamPlayPage() {
  const router = useRouter();
  const active = useExamStore((s) => s.active);
  const questions = useExamStore((s) => s.questions);
  const [hydrated, setHydrated] = React.useState(false);

  // Wait for the persisted store to rehydrate before deciding to redirect.
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated && (!active || questions.length === 0)) {
      router.replace("/exam/setup");
    }
  }, [hydrated, active, questions.length, router]);

  if (!hydrated || !active || questions.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <ExamRunner />;
}
