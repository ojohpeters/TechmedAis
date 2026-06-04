"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";

export function NotificationToggle() {
  const [enabled, setEnabled] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (typeof Notification !== "undefined") setEnabled(Notification.permission === "granted");
  }, []);

  async function toggle(next: boolean) {
    setBusy(true);
    try {
      if (next) {
        const res = await subscribeToPush();
        if (res.ok) { setEnabled(true); toast.success("Daily reminders enabled 🔔"); }
        else toast.error(res.error ?? "Could not enable notifications");
      } else {
        await unsubscribeFromPush();
        setEnabled(false);
        toast.success("Notifications disabled");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-techmed-gradient/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Daily streak reminders</p>
            <p className="text-xs text-muted-foreground">Get notified to keep your streak alive.</p>
          </div>
        </div>
        <Switch checked={enabled} disabled={busy} onCheckedChange={toggle} />
      </CardContent>
    </Card>
  );
}
