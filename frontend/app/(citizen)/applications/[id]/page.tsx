"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, CheckCircle2, XCircle, Trash2, CreditCard, Award } from "lucide-react";
import { applicationService } from "@/services/applicationService";
import { serviceService } from "@/services/serviceService";
import { paymentService } from "@/services/paymentService";
import type { Application } from "@/types/application";
import type { Service } from "@/types/service";

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

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [values, setValues] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[] | null>(null);
  const [payingNow, setPayingNow] = useState(false);
  const paymentResult = searchParams.get("payment"); // "success" | "failed" | "error" | null, set by the backend callback redirect

  const refresh = useCallback(async () => {
    const app = await applicationService.get(params.id);
    setApplication(app);
    setValues(app.field_values ?? {});
    if (app.service) {
      const full = await serviceService.getBySlug(app.service.slug);
      setService(full);
    }
  }, [params.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Clear the ?payment= param from the URL after reading it once, so a
    // page refresh doesn't keep re-showing a stale result banner.
    if (paymentResult) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [paymentResult]);

  const isEditable = application?.status === "draft" || application?.status === "correction_required";

  async function handleSaveFields() {
    if (!application) return;
    setSaving(true);
    try {
      await applicationService.saveFields(
  application.id,
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value ?? ""])
  )
);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(requirementId: string, file: File) {
    if (!application) return;
    await applicationService.uploadDocument(application.id, requirementId, file);
    refresh();
  }

  async function handleDeleteDocument(documentId: string) {
    if (!application) return;
    await applicationService.deleteDocument(application.id, documentId);
    refresh();
  }

  async function handleSubmit() {
    if (!application) return;
    setSubmitting(true);
    setSubmitErrors(null);
    // Save whatever is currently in the form before attempting submission.
    await applicationService.saveFields(
  application.id,
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value ?? ""])
  )
);
    const result = await applicationService.submit(application.id);
    setSubmitting(false);
    if (result.success) {
      setApplication(result.application);
    } else {
      setSubmitErrors(result.errors);
    }
  }

  async function handlePayNow() {
    if (!application) return;
    setPayingNow(true);
    try {
      const { checkout_url } = await paymentService.initialize(application.id);
      window.location.href = checkout_url; // full navigation — this may be a real gateway's hosted page
    } catch {
      setPayingNow(false);
    }
  }

  async function handleCancel() {
    if (!application || !confirm("Cancel this application? This cannot be undone.")) return;
    await applicationService.cancel(application.id);
    router.push("/applications");
  }

  if (!application || !service) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  return (
    <div>
      <Link href="/applications" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to applications
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{service.name}</h1>
          <p className="text-sm text-ink-muted">{application.application_reference}</p>
        </div>
        <span className="rounded-full bg-brand-light-green px-3 py-1 text-xs font-medium text-brand-deep-green">
          {STATUS_LABELS[application.status] ?? application.status}
        </span>
      </div>

      {paymentResult === "success" && (
        <div className="mt-4 flex items-center gap-2 rounded-card border border-brand-green/30 bg-brand-light-green p-4 text-sm text-brand-deep-green">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Payment confirmed. Your application is now processing.
        </div>
      )}
      {paymentResult === "failed" && (
        <div className="mt-4 flex items-center gap-2 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle className="h-4 w-4 shrink-0" />
          We couldn't confirm that payment. You can try again below.
        </div>
      )}

      {application.status === "payment_pending" && (
        <div className="mt-4 rounded-card border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Your application has been submitted and is awaiting payment of{" "}
            <strong>
              {application.currency} {application.fee?.toLocaleString()}
            </strong>{" "}
            before processing begins.
          </p>
          <button onClick={handlePayNow} disabled={payingNow} className="btn-primary mt-3">
            {payingNow ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            Pay now
          </button>
        </div>
      )}

      {application.status === "processing" && (
        <div className="mt-4 rounded-card border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Your application is queued for processing. You'll be notified once your document is ready.
        </div>
      )}

      {application.status === "completed" && (
        <div className="mt-4 flex items-center justify-between rounded-card border border-brand-green/30 bg-brand-light-green p-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-brand-deep-green">
              <Award className="h-4 w-4" />
              Your certificate is ready
            </p>
            <p className="mt-1 text-xs text-brand-deep-green/80">
              You can download it any time from your certificate library.
            </p>
          </div>
          <Link href="/certificates" className="btn-primary">
            View certificate
          </Link>
        </div>
      )}

      {isEditable && (
        <>
          {/* Dynamic application fields */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-ink">Application details</h2>
            <div className="mt-3 space-y-4">
              {service.fields.map((field) => (
                <div key={field.id}>
                  <label className="mb-1 block text-xs font-medium text-ink-muted">
                    {field.label}
                    {field.is_required && <span className="ml-1 text-red-500">*</span>}
                  </label>
                  {field.field_type === "textarea" ? (
                    <textarea
                      value={values[field.field_key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.field_key]: e.target.value }))}
                      placeholder={field.placeholder ?? undefined}
                      className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
                      rows={3}
                    />
                  ) : field.field_type === "select" ? (
                    <select
                      value={values[field.field_key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.field_key]: e.target.value }))}
                      className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
                    >
                      <option value="">Select…</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.field_type === "date" ? "date" : field.field_type === "number" ? "number" : "text"}
                      value={values[field.field_key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.field_key]: e.target.value }))}
                      placeholder={field.placeholder ?? undefined}
                      className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
                    />
                  )}
                  {field.help_text && <p className="mt-1 text-xs text-ink-muted">{field.help_text}</p>}
                </div>
              ))}
            </div>
            <button onClick={handleSaveFields} disabled={saving} className="btn-secondary mt-4">
              {saving ? "Saving…" : "Save progress"}
            </button>
          </div>

          {/* Document requirements */}
          {service.requirements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-ink">Required documents</h2>
              <div className="mt-3 space-y-3">
                {service.requirements.map((req) => {
                  const uploaded = application.documents.find((d) => d.requirement_id === req.id);
                  return (
                    <div key={req.id} className="card flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {req.name}
                          {req.is_required && <span className="ml-1 text-red-500">*</span>}
                        </p>
                        {uploaded ? (
                          <p className="mt-1 flex items-center gap-1 text-xs text-brand-green">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {uploaded.original_filename}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-ink-muted">
                            Accepts: {req.accepted_file_types ?? "any"}
                          </p>
                        )}
                      </div>
                      {uploaded ? (
                        <button
                          onClick={() => handleDeleteDocument(uploaded.id)}
                          className="text-ink-muted hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <label className="btn-secondary cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(req.id, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {submitErrors && (
            <div className="mt-6 rounded-card border border-red-200 bg-red-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-red-700">
                <XCircle className="h-4 w-4" /> Please fix the following before submitting:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
                {submitErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 border-t border-black/5 pt-6">
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit application
            </button>
            <button onClick={handleCancel} className="text-sm text-ink-muted hover:text-red-600">
              Cancel application
            </button>
          </div>
        </>
      )}

      {/* Status timeline */}
      {application.status_history.length > 0 && (
        <div className="mt-10 border-t border-black/5 pt-6">
          <h2 className="text-sm font-semibold text-ink">Status history</h2>
          <ol className="mt-3 space-y-3">
            {application.status_history.map((entry, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
                <div>
                  <p className="text-ink">{STATUS_LABELS[entry.to_status] ?? entry.to_status}</p>
                  {entry.reason && <p className="text-xs text-ink-muted">{entry.reason}</p>}
                  <p className="text-xs text-ink-muted/70">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
