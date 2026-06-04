"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicQuestion, AnswerOption, ExamMode } from "@/types";

export interface ExamSettings {
  mode: ExamMode;
  subjectIds: string[];
  timeMode: "TIMED" | "UNTIMED" | "CUSTOM";
  durationSeconds: number; // 0 = untimed
  difficulty: "MIXED" | "EASY" | "MEDIUM" | "HARD";
  source: string;
  year?: number;
}

interface ExamState {
  active: boolean;
  settings: ExamSettings | null;
  questions: PublicQuestion[];
  answers: Record<string, AnswerOption | null>;
  flagged: Record<string, boolean>;
  current: number;
  startedAt: number | null;
  elapsedBeforePause: number; // seconds accumulated before the current resume
  paused: boolean;
  // actions
  startExam: (settings: ExamSettings, questions: PublicQuestion[]) => void;
  answer: (questionId: string, option: AnswerOption | null) => void;
  toggleFlag: (questionId: string) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  setPaused: (paused: boolean) => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      active: false,
      settings: null,
      questions: [],
      answers: {},
      flagged: {},
      current: 0,
      startedAt: null,
      elapsedBeforePause: 0,
      paused: false,

      startExam: (settings, questions) =>
        set({
          active: true,
          settings,
          questions,
          answers: {},
          flagged: {},
          current: 0,
          startedAt: Date.now(),
          elapsedBeforePause: 0,
          paused: false,
        }),

      answer: (questionId, option) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: option } })),

      toggleFlag: (questionId) =>
        set((s) => ({ flagged: { ...s.flagged, [questionId]: !s.flagged[questionId] } })),

      goTo: (index) => {
        const max = get().questions.length - 1;
        set({ current: Math.max(0, Math.min(index, max)) });
      },

      next: () => {
        const { current, questions } = get();
        if (current < questions.length - 1) set({ current: current + 1 });
      },

      prev: () => {
        const { current } = get();
        if (current > 0) set({ current: current - 1 });
      },

      setPaused: (paused) => {
        const s = get();
        if (paused && !s.paused && s.startedAt) {
          // accumulate elapsed time, stop the clock
          const delta = Math.floor((Date.now() - s.startedAt) / 1000);
          set({ paused: true, elapsedBeforePause: s.elapsedBeforePause + delta, startedAt: null });
        } else if (!paused && s.paused) {
          set({ paused: false, startedAt: Date.now() });
        }
      },

      reset: () =>
        set({
          active: false,
          settings: null,
          questions: [],
          answers: {},
          flagged: {},
          current: 0,
          startedAt: null,
          elapsedBeforePause: 0,
          paused: false,
        }),
    }),
    { name: "techmed-exam" }
  )
);

/** Total elapsed seconds, accounting for pauses. */
export function elapsedSeconds(state: ExamState): number {
  const running = state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0;
  return state.elapsedBeforePause + running;
}
