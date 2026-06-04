"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileQuestion, Upload, Users, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/questions", label: "Questions", icon: FileQuestion },
  { href: "/admin/questions/bulk", label: "Bulk Upload", icon: Upload },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: Settings2 },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
