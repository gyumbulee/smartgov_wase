"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { citizenCivicService } from "@/services/civicService";
import type { Complaint } from "@/types/civic";

export default function ComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    citizenCivicService.getComplaint(params.id).then(setComplaint);
  }, [params.id]);

  if (!complaint) return <p className="text-sm text-ink-muted">Loading…</p>;

  return (
    <div>
      <Link href="/complaints" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to complaints
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{complaint.title}</h1>
          <p className="text-sm text-ink-muted">{complaint.complaint_reference} · {complaint.category?.name}</p>
        </div>
        <span className="rounded-full bg-brand-light-green px-3 py-1 text-xs font-medium text-brand-deep-green">
          {complaint.status.replace("_", " ")}
        </span>
      </div>

      <p className="mt-4 text-sm text-ink-muted">{complaint.description}</p>
      {complaint.location && <p className="mt-2 text-xs text-ink-muted">Location: {complaint.location}</p>}

      <div className="mt-8 border-t border-black/5 pt-6">
        <h2 className="text-sm font-semibold text-ink">Status history</h2>
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
