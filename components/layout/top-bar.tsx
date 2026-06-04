import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { RankBadge } from "@/components/shared/rank-badge";

export function TopBar({
  name,
  email,
  avatar,
  isAdmin,
  points,
}: {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  isAdmin?: boolean;
  points: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" aria-label="Dashboard">
          <Logo size={32} withWordmark />
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <RankBadge points={points} size="sm" showPoints />
          </div>
          <ThemeToggle />
          <UserMenu name={name} email={email} avatar={avatar} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
