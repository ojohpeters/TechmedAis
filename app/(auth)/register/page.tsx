"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Check, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  NIGERIAN_UNIVERSITIES,
  FACULTIES,
  COURSES_BY_FACULTY,
  SUBJECT_MIN,
  SUBJECT_MAX,
} from "@/lib/constants";
import {
  personalDetailsSchema,
  academicProfileSchema,
  subjectSelectionSchema,
} from "@/lib/validations";
import { AvatarUploader } from "@/components/shared/avatar-uploader";

interface SubjectOption {
  id: string;
  name: string;
  code: string;
  icon: string | null;
  color: string | null;
  questionCount: number;
}

const STEPS = ["Personal", "Academic", "Subjects", "Profile"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([]);

  const [personal, setPersonal] = React.useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [academic, setAcademic] = React.useState({ university: "", faculty: "", course: "" });
  const [subjectIds, setSubjectIds] = React.useState<string[]>([]);
  const [profile, setProfile] = React.useState({ avatar: "", displayName: "" });

  React.useEffect(() => {
    api.get<{ subjects: SubjectOption[] }>("/api/subjects")
      .then((d) => setSubjects(d.subjects))
      .catch(() => toast.error("Could not load subjects"));
  }, []);

  const courseOptions = academic.faculty ? COURSES_BY_FACULTY[academic.faculty] ?? [] : [];

  function applyErrors(fieldErrors: Record<string, string[] | undefined>) {
    setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])));
  }

  function validateStep(): boolean {
    setErrors({});
    if (step === 0) {
      const r = personalDetailsSchema.safeParse(personal);
      if (!r.success) { applyErrors(r.error.flatten().fieldErrors); return false; }
    } else if (step === 1) {
      const r = academicProfileSchema.safeParse(academic);
      if (!r.success) { applyErrors(r.error.flatten().fieldErrors); return false; }
    } else if (step === 2) {
      const r = subjectSelectionSchema.safeParse({ subjectIds });
      if (!r.success) { toast.error(r.error.flatten().fieldErrors.subjectIds?.[0] ?? "Invalid selection"); return false; }
    }
    return true;
  }

  function next() {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function toggleSubject(id: string) {
    setSubjectIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= SUBJECT_MAX) {
        toast.error(`You can select at most ${SUBJECT_MAX} subjects`);
        return prev;
      }
      return [...prev, id];
    });
  }

  async function submit() {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await api.post("/api/register", {
        ...personal,
        ...academic,
        subjectIds,
        avatar: profile.avatar || undefined,
        displayName: profile.displayName || undefined,
      });
      toast.success("Account created! Signing you in…");
      const res = await signIn("credentials", { email: personal.email, password: personal.password, redirect: false });
      if (res?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-300">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>

      {/* Stepper */}
      <div className="mt-5 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                i < step ? "bg-techmed-cyan text-techmed-navy" : i === step ? "bg-techmed-blue text-white" : "bg-white/10 text-slate-400"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 flex-1 rounded", i < step ? "bg-techmed-cyan" : "bg-white/10")} />
            )}
          </div>
        ))}
      </div>

      <Card className="mt-6 border-white/10 bg-white/5 text-white backdrop-blur">
        <CardContent className="pt-6">
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <Field label="Full name" error={errors.name}>
                <Input value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} placeholder="Adaeze Okeke" className="bg-white/5" />
              </Field>
              <Field label="Email address" error={errors.email}>
                <Input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} placeholder="you@example.com" className="bg-white/5" />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <Input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} placeholder="08012345678" className="bg-white/5" />
              </Field>
              <Field label="Password" error={errors.password}>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} value={personal.password} onChange={(e) => setPersonal({ ...personal, password: e.target.value })} placeholder="At least 8 chars, 1 letter & 1 number" className="bg-white/5 pr-10" />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm password" error={errors.confirmPassword}>
                <Input type="password" value={personal.confirmPassword} onChange={(e) => setPersonal({ ...personal, confirmPassword: e.target.value })} placeholder="Re-enter your password" className="bg-white/5" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <Field label="University" error={errors.university}>
                <Combobox
                  options={NIGERIAN_UNIVERSITIES}
                  value={academic.university}
                  onChange={(v) => setAcademic({ ...academic, university: v })}
                  placeholder="Search your university"
                  className="bg-white/5"
                />
              </Field>
              <Field label="Faculty" error={errors.faculty}>
                <Combobox
                  options={FACULTIES}
                  value={academic.faculty}
                  onChange={(v) => setAcademic({ ...academic, faculty: v, course: "" })}
                  placeholder="Select your faculty"
                  className="bg-white/5"
                />
              </Field>
              <Field label="Course / Department" error={errors.course}>
                <Combobox
                  options={courseOptions.length ? courseOptions : ["Select a faculty first"]}
                  value={academic.course}
                  onChange={(v) => setAcademic({ ...academic, course: v })}
                  placeholder="Select your course"
                  disabled={!academic.faculty}
                  className="bg-white/5"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <p className="mb-3 text-sm text-slate-300">
                Choose {SUBJECT_MIN}–{SUBJECT_MAX} subjects. These become your default exam subjects.
                <span className="ml-1 font-semibold text-techmed-cyan">{subjectIds.length} selected</span>
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {subjects.map((s) => {
                  const selected = subjectIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSubject(s.id)}
                      className={cn(
                        "relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all active:scale-[0.97]",
                        selected ? "border-techmed-cyan bg-techmed-cyan/10" : "border-white/10 bg-white/5 hover:border-white/30"
                      )}
                    >
                      <span className="text-2xl">{s.icon ?? "📘"}</span>
                      <span className="text-sm font-semibold leading-tight">{s.name}</span>
                      <span className="text-[10px] text-slate-400">{s.questionCount} questions</span>
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-techmed-cyan text-techmed-navy">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col items-center">
                <AvatarUploader
                  value={profile.avatar}
                  name={profile.displayName || personal.name}
                  onChange={(url) => setProfile({ ...profile, avatar: url })}
                />
                <p className="mt-2 text-xs text-slate-400">Upload an avatar (optional)</p>
              </div>
              <Field label="Display name / Nickname (optional)">
                <Input value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} placeholder={personal.name || "How should we call you?"} className="bg-white/5" />
              </Field>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <p className="font-semibold text-white">Almost done! 🎉</p>
                <p className="mt-1">You're registering with {subjectIds.length} subjects at {academic.university || "your university"}.</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            {step > 0 && (
              <Button type="button" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={back} disabled={loading}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" variant="gradient" className="ml-auto" onClick={next}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" variant="gradient" className="ml-auto" onClick={submit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-techmed-cyan hover:underline">Log in</Link>
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
