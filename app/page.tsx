import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { RANKS } from "@/lib/gamification";
import { SUBJECTS } from "@/lib/constants";
import { BookOpenCheck, Flame, Trophy, Zap, BarChart3, WifiOff } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const features = [
    { icon: BookOpenCheck, title: "Real Past Questions", desc: "Practice authentic Post-UTME questions from universities across Nigeria." },
    { icon: Zap, title: "Smart CBT Engine", desc: "Timed exams, practice mode with instant explanations, and question flagging." },
    { icon: Flame, title: "Daily Streaks", desc: "Build a study habit. Earn freeze tokens and milestone badges." },
    { icon: Trophy, title: "Leaderboards", desc: "Compete globally, within your university, weekly and monthly." },
    { icon: BarChart3, title: "Performance Insights", desc: "Track scores per subject and watch your progress climb." },
    { icon: WifiOff, title: "Works Offline", desc: "Install it like an app and keep practising even without data." },
  ];

  return (
    <div className="min-h-dvh bg-techmed-navy text-white">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo size={40} withWordmark variant="light" />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 text-center md:pt-20">
        <span className="inline-flex items-center rounded-full border border-techmed-cyan/30 bg-techmed-cyan/10 px-4 py-1.5 text-sm font-medium text-techmed-cyan">
          🎓 Post-UTME Exam Preparation Platform
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Ace your Post-UTME. <span className="text-gradient">Think Smart. Perform Elite.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
          TECHMED AIS Brainstorming is the CBT platform built for Nigerian university candidates.
          Practice thousands of past questions, track your streak, and climb the ranks — anywhere, even offline.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="xl" variant="gradient" className="w-full sm:w-auto">
            <Link href="/register">Create free account</Link>
          </Button>
          <Button asChild size="xl" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white sm:w-auto">
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {SUBJECTS.slice(0, 10).map((s) => (
            <span key={s.code} className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
              {s.icon} {s.name}
            </span>
          ))}
          <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">+ more</span>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-techmed-gradient">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ranks */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-bold md:text-3xl">Climb the ranks</h2>
        <p className="mt-2 text-center text-slate-300">Earn points on every question and rise from Rookie to TECHMED Legend.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {RANKS.map((r) => (
            <div
              key={r.key}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: `${r.color}55`, backgroundColor: `${r.color}15`, color: r.color }}
            >
              <span className="text-lg">{r.emoji}</span>
              <span>{r.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 py-16 text-center">
        <div className="rounded-3xl border border-techmed-cyan/20 bg-gradient-to-br from-techmed-blue/20 to-techmed-cyan/10 p-10">
          <h2 className="text-2xl font-bold md:text-3xl">Ready to become exam-ready?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Join thousands of candidates sharpening their skills daily. It's free to start.
          </p>
          <Button asChild size="xl" variant="gradient" className="mt-6">
            <Link href="/register">Start practising now</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} TECHMED AIS Brainstorming · Think Smart. Perform Elite.</p>
      </footer>
    </div>
  );
}
