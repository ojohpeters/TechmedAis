"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is TECHMED AIS Brainstorming?",
    a: "It's a Computer-Based Test (CBT) platform where Nigerian university candidates practice real Post-UTME past questions — timed like the real exam, with instant explanations, streaks, and leaderboards.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. Creating an account and practising is free. You pick your subjects during registration and can start an exam straight away.",
  },
  {
    q: "Which universities and subjects are covered?",
    a: "Questions span major Nigerian universities across core Post-UTME subjects — English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature and more. You can filter by your own university or practise across all of them.",
  },
  {
    q: "Can I use it offline?",
    a: "Yes. TECHMED is a Progressive Web App — install it to your home screen on Android or iOS and your recently practised questions stay available even without data.",
  },
  {
    q: "How do streaks and ranks work?",
    a: "Complete at least one exam a day to keep your streak alive and earn bonus points. As your total points grow you climb from Rookie all the way to TECHMED Legend, and you earn freeze tokens to protect your streak on a busy day.",
  },
  {
    q: "How are exams scored?",
    a: "Each correct answer earns points (more for harder questions), with bonuses for perfect scores and your first attempt of the day. After every exam you get a full breakdown by subject plus answer review with explanations.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04]"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-white">{item.q}</span>
              <Plus
                className={cn(
                  "h-5 w-5 shrink-0 text-techmed-cyan transition-transform duration-300",
                  isOpen && "rotate-45"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-300">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
