"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { applicationService } from "@/services/applicationService";
import type { Application } from "@/types/application";

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

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  payment_pending: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  completed: "Completed",
  correction_required: "Needs correction",
  failed: "Failed",
  cancelled: "Cancelled",
};

export default function ApplicationsListPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);

  useEffect(() => {
    applicationService.list().then(setApplications);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">My applications</h1>
          <p className="mt-1 text-sm text-ink-muted">Track status and continue drafts.</p>
        </div>
        <Link href="/services" className="btn-primary">
          Apply for a service
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {applications?.map((app) => (
          <Link
            key={app.id}
            href={`/applications/${app.id}`}
            className="card flex items-center justify-between hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{app.service?.name ?? "Application"}</p>
                <p className="text-xs text-ink-muted">{app.application_reference}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[app.status] ?? ""}`}>
                {STATUS_LABELS[app.status] ?? app.status}
              </span>
              <ArrowRight className="h-4 w-4 text-ink-muted" />
            </div>
          </Link>
        ))}

        {applications?.length === 0 && (
          <div className="flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
            <FileText className="h-8 w-8 text-ink-muted" />
            <p className="mt-3 text-sm font-medium text-ink">No applications yet</p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              You haven't submitted any government service applications.
            </p>
            <Link href="/services" className="btn-primary mt-4">
              Browse services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
