"use client";

import * as React from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "techmed-install-dismissed";

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-md animate-fade-in rounded-2xl border border-border bg-card p-4 shadow-xl md:bottom-6">
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install TECHMED AIS</p>
          <p className="text-xs text-muted-foreground">Add to your home screen for offline practice & a faster app.</p>
        </div>
        <button onClick={dismiss} className="text-muted-foreground" aria-label="Dismiss">
          <X className="h-5 w-5" />
        </button>
      </div>
      <Button onClick={install} variant="gradient" className="mt-3 w-full">
        <Download className="h-4 w-4" /> Install app
      </Button>
    </div>
  );
}
