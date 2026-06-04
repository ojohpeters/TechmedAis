import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-techmed-navy px-6 text-center text-white">
      <Logo size={56} />
      <h1 className="mt-8 text-6xl font-extrabold text-gradient">404</h1>
      <p className="mt-2 text-lg font-semibold">Page not found</p>
      <p className="mt-1 max-w-sm text-slate-300">The page you're looking for doesn't exist or has moved.</p>
      <Button asChild variant="gradient" className="mt-6">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
