"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { adminCivicService } from "@/services/civicService";
import type { ContactMessage } from "@/types/civic";

const STATUS_OPTIONS = ["new", "read", "in_progress", "resolved", "spam"];

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  function refresh() {
    adminCivicService.listContactMessages().then(setMessages);
  }
  useEffect(refresh, []);

  async function handleStatusChange(id: string, status: string) {
    await adminCivicService.updateContactMessageStatus(id, status);
    refresh();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Contact messages</h1>
      <p className="mt-1 text-sm text-ink-muted">Messages submitted through the public contact form.</p>

      <div className="mt-6 space-y-3">
        {messages?.map((m) => (
          <div key={m.id} className="card">
            <button
              onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{m.subject}</p>
                  <p className="text-xs text-ink-muted">{m.name} · {m.email}</p>
                </div>
              </div>
              <select
                value={m.status}
                onChange={(e) => handleStatusChange(m.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="rounded-md border border-black/10 px-2 py-1 text-xs outline-none focus:border-brand-green"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </button>
            {expanded === m.id && (
              <p className="mt-3 border-t border-black/5 pt-3 text-sm text-ink-muted">{m.message}</p>
            )}
          </div>
        ))}
        {messages?.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No messages yet.
          </p>
        )}
      </div>
    </div>
  );
}
