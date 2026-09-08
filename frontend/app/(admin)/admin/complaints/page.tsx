"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareWarning } from "lucide-react";
import { adminCivicService } from "@/services/civicService";
import type { Complaint } from "@/types/civic";

const STATUS_OPTIONS = ["", "submitted", "received", "assigned", "in_progress", "resolved", "closed", "rejected"];

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-surface-bg text-ink-muted",
  received: "bg-blue-50 text-blue-700",
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-brand-light-green text-brand-deep-green",
  closed: "bg-surface-bg text-ink-muted",
  rejected: "bg-red-50 text-red-700",
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    adminCivicService.listComplaints(status || undefined).then(setComplaints);
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Complaints</h1>
          <p className="mt-1 text-sm text-ink-muted">A genuine manual workflow — staff work these directly.</p>
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
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {complaints?.map((c) => (
              <tr key={c.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/complaints/${c.id}`} className="font-medium text-ink hover:text-brand-green">
                    {c.complaint_reference}
                  </Link>
                  <p className="text-xs text-ink-muted">{c.title}</p>
                </td>
                <td className="px-4 py-3 text-ink-muted">{c.citizen?.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{c.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[c.status] ?? ""}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {complaints?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-muted">
                  <MessageSquareWarning className="mx-auto mb-2 h-6 w-6 text-ink-muted" />
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
