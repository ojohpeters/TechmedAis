"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { AvatarUploader } from "@/components/shared/avatar-uploader";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { NIGERIAN_UNIVERSITIES, FACULTIES, COURSES_BY_FACULTY, SUBJECT_MIN, SUBJECT_MAX } from "@/lib/constants";

interface SubjectLite { id: string; name: string; icon: string | null }

export function EditProfileDialog({
  initial,
  allSubjects,
  selectedSubjectIds,
}: {
  initial: { name: string; displayName: string; phone: string; university: string; faculty: string; course: string; avatar: string };
  allSubjects: SubjectLite[];
  selectedSubjectIds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState(initial);
  const [subjects, setSubjects] = React.useState<string[]>(selectedSubjectIds);

  const courses = form.faculty ? COURSES_BY_FACULTY[form.faculty] ?? [] : [];

  function toggleSubject(id: string) {
    setSubjects((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= SUBJECT_MAX) { toast.error(`Max ${SUBJECT_MAX} subjects`); return prev; }
      return [...prev, id];
    });
  }

  async function save() {
    if (subjects.length < SUBJECT_MIN) { toast.error(`Select at least ${SUBJECT_MIN} subjects`); return; }
    setSaving(true);
    try {
      await api.patch("/api/profile", {
        name: form.name,
        displayName: form.displayName,
        phone: form.phone || undefined,
        university: form.university || undefined,
        faculty: form.faculty || undefined,
        course: form.course || undefined,
        avatar: form.avatar,
        subjectIds: subjects,
      });
      toast.success("Profile updated");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <AvatarUploader value={form.avatar} name={form.name} onChange={(url) => setForm({ ...form, avatar: url })} size={80} />
          </div>
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>University</Label>
            <Combobox options={NIGERIAN_UNIVERSITIES} value={form.university} onChange={(v) => setForm({ ...form, university: v })} />
          </div>
          <div className="space-y-1.5">
            <Label>Faculty</Label>
            <Combobox options={FACULTIES} value={form.faculty} onChange={(v) => setForm({ ...form, faculty: v, course: "" })} />
          </div>
          <div className="space-y-1.5">
            <Label>Course</Label>
            <Combobox options={courses.length ? courses : ["Select a faculty first"]} value={form.course} onChange={(v) => setForm({ ...form, course: v })} disabled={!form.faculty} />
          </div>
          <div className="space-y-1.5">
            <Label>Subjects ({subjects.length} selected)</Label>
            <div className="grid grid-cols-3 gap-2">
              {allSubjects.map((s) => {
                const on = subjects.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSubject(s.id)} className={cn("relative rounded-lg border p-2 text-center text-xs transition-colors", on ? "border-primary bg-primary/5" : "border-border")}>
                    <span className="block text-lg">{s.icon ?? "📘"}</span>
                    <span className="block truncate">{s.name}</span>
                    {on && <Check className="absolute right-1 top-1 h-3 w-3 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="gradient" className="w-full" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
