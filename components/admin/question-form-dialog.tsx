"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { questionSchema } from "@/lib/validations";
import { NIGERIAN_UNIVERSITIES } from "@/lib/constants";

interface SubjectLite { id: string; name: string }
export interface QuestionRecord {
  id: string;
  subjectId: string;
  university: string;
  year: number;
  questionText: string;
  optionA: string; optionB: string; optionC: string; optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

const EMPTY: QuestionRecord = {
  id: "", subjectId: "", university: "", year: new Date().getFullYear(),
  questionText: "", optionA: "", optionB: "", optionC: "", optionD: "",
  correctAnswer: "A", explanation: "", difficulty: "MEDIUM",
};

export function QuestionFormDialog({
  open,
  onOpenChange,
  subjects,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  subjects: SubjectLite[];
  initial?: QuestionRecord | null;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<QuestionRecord>(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const editing = !!initial?.id;

  React.useEffect(() => {
    setForm(initial ?? EMPTY);
  }, [initial, open]);

  async function save() {
    const parsed = questionSchema.safeParse({ ...form, year: Number(form.year) });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fill all fields correctly");
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.patch(`/api/admin/questions/${initial!.id}`, parsed.data);
      else await api.post("/api/admin/questions", parsed.data);
      toast.success(editing ? "Question updated" : "Question added");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit question" : "Add question"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as QuestionRecord["difficulty"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>University</Label>
            <Combobox options={NIGERIAN_UNIVERSITIES} value={form.university} onChange={(v) => setForm({ ...form, university: v })} placeholder="Select university" />
          </div>
          <div className="space-y-1.5">
            <Label>Question</Label>
            <textarea
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["A", "B", "C", "D"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label>Option {k}</Label>
                <Input value={form[`option${k}` as "optionA"]} onChange={(e) => setForm({ ...form, [`option${k}`]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Correct answer</Label>
              <Select value={form.correctAnswer} onValueChange={(v) => setForm({ ...form, correctAnswer: v as QuestionRecord["correctAnswer"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["A", "B", "C", "D"] as const).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Explanation (optional)</Label>
            <textarea
              value={form.explanation ?? ""}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button variant="gradient" onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? "Update" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { EMPTY as EMPTY_QUESTION };
