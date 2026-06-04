import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ExamPreview } from "@/components/landing/exam-preview";
import { BookOpenCheck, Zap, Trophy, ArrowLeft } from "lucide-react";

const POINTS = [
  { icon: BookOpenCheck, text: "Real Post-UTME past questions" },
  { icon: Zap, text: "Timed CBT engine with instant explanations" },
  { icon: Trophy, text: "Streaks, ranks & leaderboards" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-techmed-navy text-white lg:grid lg:grid-cols-2">
      {/* ── Brand panel (desktop) ─────────────────────────────── */}
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid grid-mask opacity-70" />
          <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-techmed-blue/30 blur-[120px] animate-float-slow" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-techmed-cyan/20 blur-[120px] animate-float" />
        </div>

        <Link href="/" aria-label="Home" className="w-fit">
          <Logo size={40} withWordmark variant="light" />
        </Link>

        <div className="max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            <span className="text-gradient-pan animate-gradient-pan">Think Smart.</span>
            <br />
            Perform Elite.
          </h2>
          <p className="mt-4 text-slate-300">
            Join thousands of Nigerian candidates practising Post-UTME past questions and climbing the ranks.
          </p>
          <ul className="mt-7 space-y-3">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-techmed-gradient">
                  <p.icon className="h-4 w-4 text-white" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
          <div className="mt-9 scale-[0.92] origin-left">
            <ExamPreview />
          </div>
        </div>

        <p className="text-xs text-slate-500">© {new Date().getFullYear()} TECHMED AIS Brainstorming</p>
      </aside>

      {/* ── Form area ─────────────────────────────────────────── */}
      <main className="relative flex min-h-dvh flex-col">
        {/* Mobile ambient + header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-grid grid-mask opacity-60 lg:hidden" />
        <header className="flex items-center justify-between px-5 py-6 lg:hidden">
          <Link href="/" aria-label="Home">
            <Logo size={34} withWordmark variant="light" />
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-2 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/"
              className="mb-5 hidden w-fit items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-techmed-cyan lg:flex"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
