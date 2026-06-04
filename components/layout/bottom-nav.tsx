"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, User, PlayCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
  { href: "/exam/setup", label: "Exam", icon: PlayCircle, primary: true },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const nav = isAdmin ? [...items, { href: "/admin", label: "Admin", icon: ShieldCheck }] : items;

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          if ((item as { primary?: boolean }).primary) {
            return (
              <Link key={item.href} href={item.href} className="-mt-6 flex flex-col items-center" aria-label={item.label}>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-techmed-gradient text-white shadow-lg shadow-techmed-blue/30">
                  <item.icon className="h-7 w-7" />
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}
            >
              <item.icon className={cn("h-5 w-5", active && "fill-primary/10")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
