import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, displayName: true, email: true, avatar: true, role: true, totalPoints: true },
  });
  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-dvh bg-background">
      <TopBar
        name={user.displayName || user.name}
        email={user.email}
        avatar={user.avatar}
        isAdmin={isAdmin}
        points={user.totalPoints}
      />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:pb-12">{children}</main>
      <BottomNav isAdmin={isAdmin} />
      <PwaInstallPrompt />
    </div>
  );
}
