"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Banknote, Clock, ShieldCheck, FileCheck2, ArrowRight, Loader2 } from "lucide-react";
import { serviceService } from "@/services/serviceService";
import { applicationService } from "@/services/applicationService";
import type { Service } from "@/types/service";

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    serviceService
      .getBySlug(params.slug)
      .then(setService)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  async function handleApply() {
    if (!service) return;

    if (!window.localStorage.getItem("smartgov_token")) {
      router.push("/register");
      return;
    }

    setApplying(true);
    try {
      const application = await applicationService.createForService(service.id);
      router.push(`/applications/${application.id}`);
    } catch {
      // Most likely identity/eligibility isn't verified on this account,
      // or the person isn't logged in as a citizen — send them to their
      // dashboard where that status is visible rather than failing silently.
      router.push("/dashboard");
    } finally {
      setApplying(false);
    }
  }

  if (notFound) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-medium text-ink-muted">Service not found</p>
        <Link href="/services" className="mt-4 inline-block text-sm font-medium text-brand-green hover:underline">
          Back to services
        </Link>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-sm text-ink-muted">Loading…</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      {service.category && (
        <span className="text-xs font-medium uppercase tracking-wide text-brand-green">
          {service.category.name}
        </span>
      )}
      <h1 className="mt-2 text-2xl font-semibold text-ink">{service.name}</h1>
      {service.short_description && (
        <p className="mt-2 text-sm text-ink-muted">{service.short_description}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card">
          <Banknote className="h-4 w-4 text-brand-green" />
          <p className="mt-2 text-sm font-semibold text-ink">
            {service.fee > 0 ? `₦${service.fee.toLocaleString()}` : "Free"}
          </p>
          <p className="text-xs text-ink-muted">Fee</p>
        </div>
        {service.estimated_processing_minutes && (
          <div className="card">
            <Clock className="h-4 w-4 text-brand-green" />
            <p className="mt-2 text-sm font-semibold text-ink">
              ~{service.estimated_processing_minutes} min
            </p>
            <p className="text-xs text-ink-muted">Typical processing</p>
          </div>
        )}
        {service.requires_identity_verification && (
          <div className="card">
            <ShieldCheck className="h-4 w-4 text-brand-green" />
            <p className="mt-2 text-sm font-semibold text-ink">Required</p>
            <p className="text-xs text-ink-muted">Identity verification</p>
          </div>
        )}
      </div>

      {service.description && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink">About this service</h2>
          <p className="mt-2 text-sm text-ink-muted">{service.description}</p>
        </div>
      )}

      {service.eligibility_description && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink">Eligibility</h2>
          <p className="mt-2 text-sm text-ink-muted">{service.eligibility_description}</p>
        </div>
      )}

      {service.requirements.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink">Requirements</h2>
          <ul className="mt-3 space-y-2">
            {service.requirements.map((req) => (
              <li key={req.id} className="flex items-start gap-2 text-sm text-ink-muted">
                <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <span>
                  {req.name}
                  {req.is_required ? "" : " (optional)"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 border-t border-black/5 pt-6">
        <button onClick={handleApply} disabled={applying} className="btn-primary">
          {applying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Apply for this service
          {!applying && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>
        <p className="mt-2 text-xs text-ink-muted">
          You'll need a verified SmartGov-Wase account to apply. If you're not
          logged in, you'll be taken to registration first.
        </p>
      </div>
    </section>
  );
}
