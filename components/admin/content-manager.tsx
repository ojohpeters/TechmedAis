"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Megaphone, BookOpen, Building2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface Subject { id: string; name: string; code: string; icon: string | null; color: string | null; _count: { questions: number; users: number } }
interface Announcement { id: string; title: string; body: string; active: boolean; createdAt: string }
interface University { name: string; students: number; questions: number; curated: boolean }

export function ContentManager() {
  return (
    <Tabs defaultValue="subjects">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="subjects"><BookOpen className="mr-1.5 h-4 w-4" /> Subjects</TabsTrigger>
        <TabsTrigger value="announcements"><Megaphone className="mr-1.5 h-4 w-4" /> Announce</TabsTrigger>
        <TabsTrigger value="universities"><Building2 className="mr-1.5 h-4 w-4" /> Unis</TabsTrigger>
      </TabsList>
      <TabsContent value="subjects"><SubjectsTab /></TabsContent>
      <TabsContent value="announcements"><AnnouncementsTab /></TabsContent>
      <TabsContent value="universities"><UniversitiesTab /></TabsContent>
    </Tabs>
  );
}

function SubjectsTab() {
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subject | null>(null);
  const [form, setForm] = React.useState({ name: "", code: "", icon: "", color: "#0066CC" });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try { setSubjects((await api.get<{ subjects: Subject[] }>("/api/admin/subjects")).subjects); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(null); setForm({ name: "", code: "", icon: "", color: "#0066CC" }); setOpen(true); }
  function openEdit(s: Subject) { setEditing(s); setForm({ name: s.name, code: s.code, icon: s.icon ?? "", color: s.color ?? "#0066CC" }); setOpen(true); }

  async function save() {
    if (!form.name || !form.code) { toast.error("Name and code are required"); return; }
    setSaving(true);
    try {
      if (editing) await api.patch(`/api/admin/subjects/${editing.id}`, form);
      else await api.post("/api/admin/subjects", form);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function del(s: Subject) {
    if (!confirm(`Delete "${s.name}"? This removes its ${s._count.questions} questions.`)) return;
    try { await api.del(`/api/admin/subjects/${s.id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button variant="gradient" size="sm" onClick={openNew}><Plus className="h-4 w-4" /> New subject</Button></div>
      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {subjects.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <span className="text-2xl">{s.icon ?? "📘"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{s.name} <span className="text-xs text-muted-foreground">({s.code})</span></p>
                  <p className="text-xs text-muted-foreground">{s._count.questions} questions · {s._count.users} students</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => del(s)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit subject" : "New subject"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={8} /></div>
              <div className="space-y-1.5"><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Colour</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-11 w-20 p-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="gradient" onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnnouncementsTab() {
  const [items, setItems] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", body: "", active: true });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try { setItems((await api.get<{ announcements: Announcement[] }>("/api/admin/announcements")).announcements); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function create() {
    if (!form.title || !form.body) { toast.error("Title and body are required"); return; }
    setSaving(true);
    try { await api.post("/api/admin/announcements", form); toast.success("Published"); setOpen(false); setForm({ title: "", body: "", active: true }); load(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  }
  async function toggle(a: Announcement) {
    try { await api.patch(`/api/admin/announcements/${a.id}`, { active: !a.active }); load(); }
    catch { toast.error("Update failed"); }
  }
  async function del(id: string) {
    if (!confirm("Delete this announcement?")) return;
    try { await api.del(`/api/admin/announcements/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gradient" size="sm"><Plus className="h-4 w-4" /> New</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New announcement</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Body</Label>
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Active</Label></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button variant="gradient" onClick={create} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Publish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No announcements yet.</p>
      ) : (
        items.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">{a.title} {a.active ? <Badge variant="success" className="px-1.5 py-0">Active</Badge> : <Badge variant="secondary" className="px-1.5 py-0">Hidden</Badge>}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.body}</p>
              </div>
              <Switch checked={a.active} onCheckedChange={() => toggle(a)} />
              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => del(a.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function UniversitiesTab() {
  const [items, setItems] = React.useState<University[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    api.get<{ universities: University[] }>("/api/admin/universities").then((d) => setItems(d.universities)).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3">
      <Input placeholder="Search universities…" value={q} onChange={(e) => setQ(e.target.value)} />
      <p className="text-xs text-muted-foreground">Universities are stored on student & question records. This catalogue shows live usage.</p>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border py-1">
            {filtered.map((u) => (
              <div key={u.name} className="flex items-center gap-3 py-2.5 text-sm">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{u.name} {u.curated && <Badge variant="outline" className="ml-1 px-1.5 py-0">curated</Badge>}</span>
                <span className="text-xs text-muted-foreground">{u.students} students · {u.questions} q's</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
