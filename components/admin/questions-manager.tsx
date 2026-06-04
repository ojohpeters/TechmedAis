"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2, FileQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { QuestionFormDialog, type QuestionRecord } from "@/components/admin/question-form-dialog";
import { api } from "@/lib/api";

interface SubjectLite { id: string; name: string }
interface QuestionRow extends QuestionRecord { subject: { name: string; icon: string | null } }

export function QuestionsManager() {
  const [subjects, setSubjects] = React.useState<SubjectLite[]>([]);
  const [rows, setRows] = React.useState<QuestionRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("all");
  const [difficulty, setDifficulty] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<QuestionRecord | null>(null);
  const pageSize = 15;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) params.set("search", search);
      if (subjectId !== "all") params.set("subjectId", subjectId);
      if (difficulty !== "all") params.set("difficulty", difficulty);
      const data = await api.get<{ questions: QuestionRow[]; total: number }>(`/api/admin/questions?${params}`);
      setRows(data.questions);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [page, search, subjectId, difficulty]);

  React.useEffect(() => {
    api.get<{ subjects: SubjectLite[] }>("/api/subjects").then((d) => setSubjects(d.subjects)).catch(() => {});
  }, []);
  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { setPage(1); }, [search, subjectId, difficulty]);

  async function del(id: string) {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    try {
      await api.del(`/api/admin/questions/${id}`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger className="w-auto min-w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-auto min-w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="gradient" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={FileQuestion} title="No questions found" description="Add a question or adjust your filters." actionLabel="Add question" onAction={() => { setEditing(null); setDialogOpen(true); }} />
      ) : (
        <div className="space-y-2">
          {rows.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{q.subject.icon} {q.subject.name}</Badge>
                    <Badge variant="outline">{q.university.split("(")[0].trim()}</Badge>
                    <Badge variant="outline">{q.year}</Badge>
                    <Badge variant={q.difficulty === "HARD" ? "destructive" : q.difficulty === "EASY" ? "success" : "default"}>{q.difficulty}</Badge>
                    <Badge variant="gradient">Ans: {q.correctAnswer}</Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium">{q.questionText}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(q); setDialogOpen(true); }} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del(q.id)} aria-label="Delete" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">{total} questions · page {page}/{totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      <QuestionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} subjects={subjects} initial={editing} onSaved={load} />
    </div>
  );
}
