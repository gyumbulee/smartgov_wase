"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminCivicService } from "@/services/civicService";
import type { Complaint } from "@/types/civic";

const STATUS_OPTIONS = ["submitted", "received", "assigned", "in_progress", "resolved", "closed", "rejected"];

export default function AdminComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    adminCivicService.getComplaint(params.id).then((c) => {
      setComplaint(c);
      setStatus(c.status);
    });
  }
  useEffect(refresh, [params.id]);

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCivicService.updateComplaintStatus(params.id, status, message || undefined);
      setMessage("");
      refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!complaint) return <p className="text-sm text-ink-muted">Loading…</p>;

  return (
    <div>
      <Link href="/admin/complaints" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to complaints
      </Link>

      <div className="mt-3">
        <h1 className="text-xl font-semibold text-ink">{complaint.title}</h1>
        <p className="text-sm text-ink-muted">
          {complaint.complaint_reference} · {complaint.citizen?.full_name} · {complaint.category?.name}
        </p>
      </div>

      <p className="mt-4 text-sm text-ink-muted">{complaint.description}</p>
      {complaint.location && <p className="mt-2 text-xs text-ink-muted">Location: {complaint.location}</p>}

      <div className="mt-6 card">
        <h2 className="text-sm font-semibold text-ink">Update status</h2>
        <form onSubmit={handleUpdateStatus} className="mt-3 space-y-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Update note for the citizen (optional)"
            rows={3}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Update status"}
          </button>
        </form>
      </div>

      <div className="mt-8 border-t border-black/5 pt-6">
        <h2 className="text-sm font-semibold text-ink">History</h2>
        <ol className="mt-3 space-y-3">
          {complaint.updates.map((u) => (
            <li key={u.id} className="flex items-start gap-3 text-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
              <div>
                <p className="text-ink">{u.status.replace("_", " ")}</p>
                {u.message && <p className="text-xs text-ink-muted">{u.message}</p>}
                <p className="text-xs text-ink-muted/70">{new Date(u.created_at).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
