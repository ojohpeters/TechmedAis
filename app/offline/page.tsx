import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-techmed-navy px-6 text-center text-white">
      <Logo size={56} />
      <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
        <WifiOff className="h-8 w-8 text-techmed-cyan" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">You're offline</h1>
      <p className="mt-2 max-w-sm text-slate-300">
        It looks like you've lost your connection. Cached questions are still available — reconnect to sync your results and the leaderboard.
      </p>
      <Button asChild variant="gradient" className="mt-6">
        <Link href="/dashboard">Try again</Link>
      </Button>
    </div>
  );
}
