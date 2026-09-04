"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { adminOversightService } from "@/services/adminOversightService";
import type { AdminApplication } from "@/types/admin";

const STATUS_OPTIONS = [
  "", "draft", "submitted", "payment_pending", "paid", "processing",
  "completed", "correction_required", "failed", "cancelled",
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-surface-bg text-ink-muted",
  submitted: "bg-blue-50 text-blue-700",
  payment_pending: "bg-amber-50 text-amber-700",
  paid: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  completed: "bg-brand-light-green text-brand-deep-green",
  correction_required: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-surface-bg text-ink-muted",
};

// Administration monitors; it doesn't manually approve applications
// (spec §27) — this list has no "approve" action anywhere.
export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[] | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    adminOversightService.listApplications(status || undefined).then(setApplications);
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Applications</h1>
          <p className="mt-1 text-sm text-ink-muted">Oversight across all citizens.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.replace("_", " ") : "All statuses"}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Citizen</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {applications?.map((app) => (
              <tr key={app.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/applications/${app.id}`} className="font-medium text-ink hover:text-brand-green">
                    {app.application_reference}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">{app.citizen?.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{app.service?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[app.status] ?? ""}`}>
                    {app.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {applications?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-muted">
                  <FileText className="mx-auto mb-2 h-6 w-6 text-ink-muted" />
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
