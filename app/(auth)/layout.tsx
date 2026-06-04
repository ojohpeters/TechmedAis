import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-techmed-navy text-white">
      <header className="mx-auto w-full max-w-md px-5 py-6">
        <Link href="/" aria-label="Home">
          <Logo size={36} withWordmark variant="light" />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-10">
        {children}
      </main>
    </div>
  );
}
