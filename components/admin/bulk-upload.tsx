"use client";

import * as React from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { UploadCloud, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { csvQuestionRowSchema } from "@/lib/validations";

interface SubjectLite { id: string; name: string; code: string }

interface ParsedRow {
  index: number;
  raw: Record<string, string>;
  valid: boolean;
  errors: string[];
  resolved?: {
    subjectId: string;
    university: string;
    year: number;
    questionText: string;
    optionA: string; optionB: string; optionC: string; optionD: string;
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
  };
}

const TEMPLATE_HEADERS = ["subject", "university", "year", "question", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation", "difficulty"];

const SAMPLE_ROW = [
  "Mathematics", "University of Lagos (UNILAG)", "2022", "If 2x + 3 = 11, what is x?",
  "3", "4", "5", "7", "B", "2x = 8 so x = 4", "EASY",
];

export function BulkUpload() {
  const [subjects, setSubjects] = React.useState<SubjectLite[]>([]);
  const [rows, setRows] = React.useState<ParsedRow[]>([]);
  const [fileName, setFileName] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<{ inserted: number } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    api.get<{ subjects: SubjectLite[] }>("/api/subjects").then((d) => setSubjects(d.subjects)).catch(() => {});
  }, []);

  const subjectByName = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of subjects) {
      map.set(s.name.toLowerCase(), s.id);
      map.set(s.code.toLowerCase(), s.id);
    }
    return map;
  }, [subjects]);

  function downloadTemplate() {
    const csv = Papa.unparse({ fields: TEMPLATE_HEADERS, data: [SAMPLE_ROW] });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "techmed-questions-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(file: File) {
    setResult(null);
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (res) => {
        const parsed: ParsedRow[] = res.data.map((raw, index) => {
          const errors: string[] = [];
          const check = csvQuestionRowSchema.safeParse(raw);
          let resolved: ParsedRow["resolved"];
          if (!check.success) {
            for (const issue of check.error.issues) errors.push(`${issue.path.join(".")}: ${issue.message}`);
          } else {
            const subjectId = subjectByName.get(check.data.subject.trim().toLowerCase());
            if (!subjectId) {
              errors.push(`Unknown subject "${check.data.subject}"`);
            } else {
              resolved = {
                subjectId,
                university: check.data.university,
                year: check.data.year,
                questionText: check.data.question,
                optionA: check.data.option_a,
                optionB: check.data.option_b,
                optionC: check.data.option_c,
                optionD: check.data.option_d,
                correctAnswer: check.data.correct_answer,
                explanation: check.data.explanation ?? "",
                difficulty: check.data.difficulty,
              };
            }
          }
          return { index, raw, valid: errors.length === 0, errors, resolved };
        });
        setRows(parsed);
        const validCount = parsed.filter((r) => r.valid).length;
        toast.success(`Parsed ${parsed.length} rows · ${validCount} valid`);
      },
      error: () => toast.error("Could not parse the CSV file"),
    });
  }

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  async function upload() {
    if (validRows.length === 0) { toast.error("No valid rows to upload"); return; }
    setUploading(true);
    setProgress(8);
    try {
      // Simulated progress while the request is in flight.
      const timer = setInterval(() => setProgress((p) => Math.min(90, p + 7)), 250);
      const res = await api.post<{ inserted: number }>("/api/admin/questions/bulk", {
        questions: validRows.map((r) => r.resolved),
      });
      clearInterval(timer);
      setProgress(100);
      setResult(res);
      toast.success(`Uploaded ${res.inserted} questions 🎉`);
      setRows([]);
      setFileName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Bulk upload questions</span>
            <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-4 w-4" /> Template</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Expected columns (header row required):</p>
            <code className="mt-1 block break-words font-mono text-[11px]">{TEMPLATE_HEADERS.join(", ")}</code>
            <p className="mt-1.5">correct_answer must be A/B/C/D · difficulty must be EASY/MEDIUM/HARD · subject must match an existing subject name or code.</p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            className={cn("flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors", dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Drag & drop your CSV here, or click to browse</p>
            {fileName && <p className="mt-1 flex items-center gap-1 text-xs text-primary"><FileSpreadsheet className="h-3.5 w-3.5" /> {fileName}</p>}
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-500/40 bg-green-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <p className="text-sm font-medium">Successfully uploaded {result.inserted} questions.</p>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span>Preview ({rows.length} rows)</span>
              <span className="flex items-center gap-2">
                <Badge variant="success">{validRows.length} valid</Badge>
                {invalidRows.length > 0 && <Badge variant="destructive">{invalidRows.length} with errors</Badge>}
                <Button variant="ghost" size="sm" onClick={() => { setRows([]); setFileName(""); }}><Trash2 className="h-4 w-4" /> Clear</Button>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploading && <Progress value={progress} className="mb-4" />}
            <div className="max-h-[420px] overflow-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Subject</th>
                    <th className="p-2">Question</th>
                    <th className="p-2">Ans</th>
                    <th className="p-2">Diff</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.index} className={cn("border-t border-border", !r.valid && "bg-red-500/5")}>
                      <td className="p-2 text-muted-foreground">{r.index + 1}</td>
                      <td className="p-2">{r.raw.subject}</td>
                      <td className="max-w-[260px] truncate p-2">{r.raw.question}</td>
                      <td className="p-2">{r.raw.correct_answer}</td>
                      <td className="p-2">{r.raw.difficulty}</td>
                      <td className="p-2">
                        {r.valid ? (
                          <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="h-3.5 w-3.5" /> OK</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500" title={r.errors.join("; ")}>
                            <AlertTriangle className="h-3.5 w-3.5" /> {r.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="gradient" onClick={upload} disabled={uploading || validRows.length === 0}>
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />} Upload {validRows.length} valid question{validRows.length === 1 ? "" : "s"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
