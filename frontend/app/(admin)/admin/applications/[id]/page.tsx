"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Banknote, FileCheck2 } from "lucide-react";
import { adminOversightService } from "@/services/adminOversightService";
import type { AdminApplication } from "@/types/admin";

export default function AdminApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<AdminApplication | null>(null);

  useEffect(() => {
    adminOversightService.getApplication(params.id).then(setApplication);
  }, [params.id]);

  if (!application) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  return (
    <div>
      <Link href="/admin/applications" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to applications
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{application.application_reference}</h1>
          <p className="text-sm text-ink-muted">
            {application.citizen?.full_name} · {application.service?.name}
          </p>
        </div>
        <span className="rounded-full bg-brand-light-green px-3 py-1 text-xs font-medium text-brand-deep-green">
          {application.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {application.fee !== null && (
          <div className="card">
            <Banknote className="h-4 w-4 text-brand-green" />
            <p className="mt-2 text-sm font-semibold text-ink">
              {application.currency} {application.fee.toLocaleString()}
            </p>
            <p className="text-xs text-ink-muted">Fee</p>
          </div>
        )}
        {application.certificate && (
          <div className="card">
            <Award className="h-4 w-4 text-brand-green" />
            <p className="mt-2 text-sm font-semibold text-ink">{application.certificate.certificate_number}</p>
            <p className="text-xs text-ink-muted">Certificate ({application.certificate.status})</p>
          </div>
        )}
        {application.documents && application.documents.length > 0 && (
          <div className="card">
            <FileCheck2 className="h-4 w-4 text-brand-green" />
            <p className="mt-2 text-sm font-semibold text-ink">{application.documents.length}</p>
            <p className="text-xs text-ink-muted">Documents uploaded</p>
          </div>
        )}
      </div>

      {application.payments && application.payments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink">Payments</h2>
          <div className="mt-3 space-y-2">
            {application.payments.map((p) => (
              <div key={p.id} className="card flex items-center justify-between py-3">
                <p className="text-sm text-ink">{p.payment_reference}</p>
                <p className="text-sm text-ink-muted">{p.currency} {p.amount.toLocaleString()}</p>
                <span className="rounded-full bg-surface-bg px-2.5 py-1 text-xs font-medium text-ink-muted">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {application.status_history && application.status_history.length > 0 && (
        <div className="mt-8 border-t border-black/5 pt-6">
          <h2 className="text-sm font-semibold text-ink">Status history</h2>
          <ol className="mt-3 space-y-3">
            {application.status_history.map((entry, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
                <div>
                  <p className="text-ink">{entry.to_status.replace("_", " ")}</p>
                  {entry.reason && <p className="text-xs text-ink-muted">{entry.reason}</p>}
                  <p className="text-xs text-ink-muted/70">{new Date(entry.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
