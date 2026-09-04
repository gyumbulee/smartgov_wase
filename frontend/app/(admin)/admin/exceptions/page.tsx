"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RotateCcw, CheckCircle2 } from "lucide-react";
import { adminOversightService } from "@/services/adminOversightService";
import type { ProcessingJob } from "@/types/admin";

// Spec §69: automation doesn't always succeed — failures land here for
// an admin to fix and retry, rather than crashing silently or getting lost.
export default function AdminExceptionsPage() {
  const [jobs, setJobs] = useState<ProcessingJob[] | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retried, setRetried] = useState<Set<string>>(new Set());

  function refresh() {
    adminOversightService.listExceptions().then(setJobs);
  }

  useEffect(refresh, []);

  async function handleRetry(job: ProcessingJob) {
    setRetryingId(job.id);
    try {
      await adminOversightService.retryException(job.id);
      setRetried((prev) => new Set(prev).add(job.id));
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Exception queue</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Automated steps that failed and need attention — most commonly a service reaching
        processing with no active certificate template configured.
      </p>

      <div className="mt-6 space-y-3">
        {jobs?.map((job) => (
          <div key={job.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-ink">
                    {job.job_type.replace("_", " ")} — {job.application?.application_reference ?? "unknown application"}
                  </p>
                  {job.application?.service_name && (
                    <p className="text-xs text-ink-muted">{job.application.service_name}</p>
                  )}
                  {job.error_message && (
                    <p className="mt-1 text-xs text-red-600">{job.error_message}</p>
                  )}
                  <p className="mt-1 text-xs text-ink-muted">
                    Failed {job.failed_at ? new Date(job.failed_at).toLocaleString() : "—"} · Attempt {job.attempts}
                  </p>
                </div>
              </div>
              {retried.has(job.id) ? (
                <span className="flex items-center gap-1 text-xs font-medium text-brand-green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Retry queued
                </span>
              ) : (
                <button
                  onClick={() => handleRetry(job)}
                  disabled={retryingId === job.id}
                  className="btn-secondary"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {retryingId === job.id ? "Retrying…" : "Retry"}
                </button>
              )}
            </div>
          </div>
        ))}

        {jobs?.length === 0 && (
          <div className="flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
            <CheckCircle2 className="h-8 w-8 text-brand-green" />
            <p className="mt-3 text-sm font-medium text-ink">No exceptions</p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Everything in the automated pipeline is running cleanly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
