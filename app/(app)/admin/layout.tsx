import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Double protection: middleware guards /admin, this re-checks the role server-side.
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-techmed-gradient text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold leading-none">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Manage questions, users & content</p>
        </div>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
