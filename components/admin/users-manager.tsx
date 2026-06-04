"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, Loader2, ShieldCheck, Ban, CircleCheck, Eye, Users as UsersIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { RankBadge } from "@/components/shared/rank-badge";
import { initials, clock, relativeTime } from "@/lib/utils";
import { getGrade } from "@/lib/gamification";
import { api } from "@/lib/api";

interface UserRow {
  id: string; name: string; displayName: string | null; email: string; avatar: string | null;
  university: string | null; course: string | null; role: "STUDENT" | "ADMIN"; suspended: boolean;
  totalPoints: number; createdAt: string; _count: { examSessions: number };
}
interface UserDetail extends UserRow {
  faculty: string | null; phone: string | null; streak: { currentStreak: number; longestStreak: number } | null;
  selectedSubjects: { id: string; name: string }[];
  badges: { id: string; label: string; emoji: string }[];
  examSessions: { id: string; percentage: number; correctCount: number; totalQuestions: number; timeTaken: number; score: number; completedAt: string }[];
}

export function UsersManager({ focusId }: { focusId?: string }) {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [detail, setDetail] = React.useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const pageSize = 15;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) params.set("search", search);
      if (role !== "all") params.set("role", role);
      const data = await api.get<{ users: UserRow[]; total: number }>(`/api/admin/users?${params}`);
      setRows(data.users);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { setPage(1); }, [search, role]);

  const openDetail = React.useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await api.get<{ user: UserDetail }>(`/api/admin/users/${id}`);
      setDetail(data.user);
    } catch {
      toast.error("Could not load user");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  React.useEffect(() => { if (focusId) openDetail(focusId); }, [focusId, openDetail]);

  async function updateUser(id: string, patch: { role?: "STUDENT" | "ADMIN"; suspended?: boolean }) {
    try {
      await api.patch(`/api/admin/users/${id}`, patch);
      toast.success("User updated");
      load();
      if (detail?.id === id) setDetail({ ...detail, ...patch });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email, university…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-auto min-w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="STUDENT">Students</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or filter." />
      ) : (
        <div className="space-y-2">
          {rows.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <Avatar className="h-10 w-10">{u.avatar ? <AvatarImage src={u.avatar} /> : null}<AvatarFallback className="text-xs">{initials(u.displayName || u.name)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                    {u.displayName || u.name}
                    {u.role === "ADMIN" && <Badge variant="gradient" className="px-1.5 py-0">Admin</Badge>}
                    {u.suspended && <Badge variant="destructive" className="px-1.5 py-0">Suspended</Badge>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{u.email} · {u.university ?? "—"}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold text-primary">{u.totalPoints.toLocaleString()} pts</p>
                  <p className="text-xs text-muted-foreground">{u._count.examSessions} exams</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openDetail(u.id)} aria-label="View"><Eye className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">{total} users · page {page}/{totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!detail || detailLoading} onOpenChange={(o) => { if (!o) setDetail(null); }}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          {detailLoading || !detail ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              <DialogHeader><DialogTitle>Student profile</DialogTitle></DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">{detail.avatar ? <AvatarImage src={detail.avatar} /> : null}<AvatarFallback>{initials(detail.displayName || detail.name)}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <p className="font-semibold">{detail.displayName || detail.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{detail.email} · {detail.phone ?? "no phone"}</p>
                  <div className="mt-1"><RankBadge points={detail.totalPoints} size="sm" showPoints /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <Stat label="Exams" value={detail._count.examSessions} />
                <Stat label="Points" value={detail.totalPoints.toLocaleString()} />
                <Stat label="Streak" value={detail.streak?.currentStreak ?? 0} />
                <Stat label="Badges" value={detail.badges.length} />
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">{detail.course ?? "—"} · {detail.faculty ?? "—"}</p>
                <p className="text-muted-foreground">{detail.university ?? "—"}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {detail.selectedSubjects.map((s) => <Badge key={s.id} variant="secondary">{s.name}</Badge>)}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Recent exams</p>
                {detail.examSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No exams yet.</p>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {detail.examSessions.map((s) => {
                      const g = getGrade(s.percentage);
                      return (
                        <div key={s.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs">
                          <span className="flex h-7 w-7 items-center justify-center rounded font-bold" style={{ backgroundColor: `${g.color}1A`, color: g.color }}>{g.letter}</span>
                          <span className="flex-1">{s.percentage}% · {s.correctCount}/{s.totalQuestions}</span>
                          <span className="text-muted-foreground">{relativeTime(s.completedAt)} · {clock(s.timeTaken)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {detail.role === "STUDENT" ? (
                  <Button variant="outline" size="sm" onClick={() => updateUser(detail.id, { role: "ADMIN" })}><ShieldCheck className="h-4 w-4" /> Make admin</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => updateUser(detail.id, { role: "STUDENT" })}><ShieldCheck className="h-4 w-4" /> Revoke admin</Button>
                )}
                {detail.suspended ? (
                  <Button variant="outline" size="sm" className="text-green-600" onClick={() => updateUser(detail.id, { suspended: false })}><CircleCheck className="h-4 w-4" /> Activate</Button>
                ) : (
                  <Button variant="outline" size="sm" className="text-red-500" onClick={() => updateUser(detail.id, { suspended: true })}><Ban className="h-4 w-4" /> Suspend</Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-2 text-center">
      <p className="text-base font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
