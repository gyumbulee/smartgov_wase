"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { adminOversightService } from "@/services/adminOversightService";
import type { AuditLogEntry } from "@/types/admin";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    adminOversightService.listAuditLogs(filter || undefined).then(setLogs);
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Audit log</h1>
          <p className="mt-1 text-sm text-ink-muted">Every sensitive administrative action, in order.</p>
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by action, e.g. service.fee_changed"
          className="w-72 rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{log.action}</td>
                <td className="px-4 py-3 text-ink-muted">{log.user ?? "system"}</td>
                <td className="px-4 py-3 text-ink-muted">{log.auditable_type ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{log.ip_address ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {logs?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-muted">
                  <History className="mx-auto mb-2 h-6 w-6 text-ink-muted" />
                  No matching audit entries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
