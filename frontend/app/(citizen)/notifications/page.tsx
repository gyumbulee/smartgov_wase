"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { citizenCivicService } from "@/services/civicService";
import type { AppNotification } from "@/types/civic";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);

  function refresh() {
    citizenCivicService.listNotifications().then(setNotifications);
  }
  useEffect(refresh, []);

  async function handleMarkRead(id: string) {
    await citizenCivicService.markNotificationRead(id);
    refresh();
  }

  async function handleMarkAllRead() {
    await citizenCivicService.markAllNotificationsRead();
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Notifications</h1>
        <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-sm text-brand-green hover:underline">
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {notifications?.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read_at && handleMarkRead(n.id)}
            className={`card flex w-full items-start gap-3 text-left ${!n.read_at ? "border-l-2 border-l-brand-green" : ""}`}
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-brand-green"}`} />
            <div>
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <p className="text-xs text-ink-muted">{n.message}</p>
              <p className="mt-1 text-xs text-ink-muted/70">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          </button>
        ))}

        {notifications?.length === 0 && (
          <div className="flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
            <Bell className="h-8 w-8 text-ink-muted" />
            <p className="mt-3 text-sm font-medium text-ink">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
