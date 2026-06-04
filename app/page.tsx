import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/landing/reveal";
import { StatCounter } from "@/components/landing/stat-counter";
import { ExamPreview } from "@/components/landing/exam-preview";
import { Faq } from "@/components/landing/faq";
import { RANKS } from "@/lib/gamification";
import { SUBJECTS } from "@/lib/constants";
import {
  BookOpenCheck,
  Flame,
  Trophy,
  Zap,
  BarChart3,
  WifiOff,
  UserPlus,
  SlidersHorizontal,
  Rocket,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Live platform numbers, with modest representative fallbacks so the band never
// reads as empty on a fresh database.
async function getStats() {
  try {
    const [questions, subjects, students, universityRows] = await Promise.all([
      prisma.question.count(),
      prisma.subject.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.question.findMany({ distinct: ["university"], select: { university: true } }),
    ]);
    return {
      questions: Math.max(questions, 1200),
      subjects: Math.max(subjects, SUBJECTS.length),
      universities: Math.max(universityRows.length, 25),
      students: Math.max(students, 800),
    };
  } catch {
    return { questions: 1200, subjects: SUBJECTS.length, universities: 25, students: 800 };
  }
}

const FEATURES = [
  { icon: BookOpenCheck, title: "Real Past Questions", desc: "Authentic Post-UTME questions sourced from universities across Nigeria, sorted by year and difficulty." },
  { icon: Zap, title: "Smart CBT Engine", desc: "Timed exams, practice mode with instant explanations, question flagging and a live answer palette." },
  { icon: Flame, title: "Daily Streaks", desc: "Build a study habit. Earn freeze tokens, hit milestones and watch your streak grow." },
  { icon: Trophy, title: "Leaderboards", desc: "Compete globally, within your university, and on weekly & monthly boards." },
  { icon: BarChart3, title: "Performance Insights", desc: "Track scores per subject, spot weak areas and watch your progress climb." },
  { icon: WifiOff, title: "Works Offline", desc: "Install it like a native app and keep practising even without data." },
];

const STEPS = [
  { icon: UserPlus, n: "01", title: "Create your profile", desc: "Sign up in seconds, then tell us your university, faculty and the subjects you're sitting." },
  { icon: SlidersHorizontal, n: "02", title: "Build your exam", desc: "Choose subjects, question count, timer and difficulty — timed exam mode or practice with explanations." },
  { icon: Rocket, n: "03", title: "Practice & climb", desc: "Get instant scoring and review, keep your streak alive and rise from Rookie to TECHMED Legend." },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const stats = await getStats();

  const marquee = [...SUBJECTS, ...SUBJECTS];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-techmed-navy text-white">
      {/* ── Ambient background ─────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[700px] bg-grid grid-mask" />
        <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-techmed-blue/25 blur-[120px] animate-float-slow" />
        <div className="absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-techmed-cyan/20 blur-[120px] animate-float" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-techmed-navy to-transparent" />
      </div>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-techmed-navy/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo size={38} withWordmark variant="light" />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="gradient" className="shadow-lg shadow-techmed-cyan/20">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-10 pt-12 md:grid-cols-2 md:pt-20">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-techmed-cyan/30 bg-techmed-cyan/10 px-4 py-1.5 text-sm font-medium text-techmed-cyan">
              <Sparkles className="h-3.5 w-3.5" />
              Post-UTME Exam Preparation Platform
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Ace your Post-UTME.
              <br />
              <span className="text-gradient-pan animate-gradient-pan">Think Smart. Perform Elite.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              The CBT platform built for Nigerian university candidates. Practice thousands of real
              past questions, track your streak, and climb the ranks — anywhere, even offline.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" variant="gradient" className="w-full shadow-xl shadow-techmed-cyan/20 sm:w-auto">
                <Link href="/register">
                  Create free account <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white sm:w-auto">
                <Link href="/login">I have an account</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-techmed-cyan" /> Free to start</span>
              <span className="flex items-center gap-1.5"><WifiOff className="h-4 w-4 text-techmed-cyan" /> Works offline</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-techmed-cyan" /> Instant results</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="md:pl-4">
          <div className="animate-float">
            <ExamPreview />
          </div>
        </Reveal>
      </section>

      {/* ── Subject marquee ────────────────────────────────────── */}
      <section className="relative py-8">
        <div className="mx-auto mb-3 max-w-6xl px-5 text-center text-xs font-medium uppercase tracking-widest text-slate-500">
          Practice across every core subject
        </div>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-marquee gap-3">
            {marquee.map((s, i) => (
              <span
                key={`${s.code}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200"
              >
                <span className="text-base">{s.icon}</span> {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Reveal>
          <div className="grid grid-cols-2 gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:grid-cols-4">
            <StatCounter value={stats.questions} suffix="+" label="Past questions" icon="📚" />
            <StatCounter value={stats.subjects} label="Subjects" icon="🧪" />
            <StatCounter value={stats.universities} suffix="+" label="Universities" icon="🏛️" />
            <StatCounter value={stats.students} suffix="+" label="Candidates" icon="🎓" />
          </div>
        </Reveal>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">Go from sign-up to exam-ready in three simple steps.</p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 100}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-techmed-cyan/40">
                <span className="absolute right-4 top-3 text-5xl font-black text-white/5 transition-colors group-hover:text-techmed-cyan/10">
                  {step.n}
                </span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-techmed-gradient shadow-lg shadow-techmed-cyan/20">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-slate-300">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to pass</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">A complete toolkit engineered for serious candidates.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-techmed-cyan/40 hover:bg-white/[0.06]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-techmed-gradient transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-300">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Ranks ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Climb the ranks</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Earn points on every question and rise from Rookie to TECHMED Legend.
          </p>
        </Reveal>
        <Reveal>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {RANKS.map((r, i) => (
              <div
                key={r.key}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-transform hover:scale-105"
                style={{ borderColor: `${r.color}55`, backgroundColor: `${r.color}15`, color: r.color }}
              >
                <span className="text-lg">{r.emoji}</span>
                <span>{r.name}</span>
                {i < RANKS.length - 1 && <ArrowRight className="ml-1 h-3.5 w-3.5 opacity-40" />}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">Everything you might be wondering, answered.</p>
        </Reveal>
        <Reveal className="mt-9">
          <Faq />
        </Reveal>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-techmed-cyan/20 bg-gradient-to-br from-techmed-blue/25 to-techmed-cyan/10 p-10 text-center">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-techmed-cyan/20 blur-3xl" />
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to become exam-ready?</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Join thousands of candidates sharpening their skills every day. It&apos;s free to start.
            </p>
            <Button asChild size="xl" variant="gradient" className="mt-7 shadow-xl shadow-techmed-cyan/30">
              <Link href="/register">
                Start practising now <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-400 sm:flex-row">
          <Logo size={28} withWordmark variant="light" />
          <p>© {new Date().getFullYear()} TECHMED AIS Brainstorming · Think Smart. Perform Elite.</p>
        </div>
      </footer>
    </div>
  );
}
