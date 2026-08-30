"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Clock, Banknote, ArrowRight } from "lucide-react";
import { serviceService } from "@/services/serviceService";
import type { Service } from "@/types/service";

// Services directory (spec §10). Only services the backend has marked
// active + published are ever returned — this page has no separate
// filtering logic to worry about that.
export default function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    serviceService
      .list()
      .then((res) => setServices(res.data))
      .catch(() => setError(true));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Government services</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Browse certificates, letters and other services offered by Wase
        Local Government. Services listed here reflect only what is
        officially administered and published.
      </p>

      {error && (
        <p className="mt-8 text-sm text-red-600">
          Couldn't load services right now. Please try again shortly.
        </p>
      )}

      {!error && services === null && (
        <p className="mt-8 text-sm text-ink-muted">Loading services…</p>
      )}

      {services?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <FileText className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No services published yet</p>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            The services directory will populate here once administrators
            publish officially authorized services.
          </p>
        </div>
      )}

      {services && services.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.slug}`} className="card flex flex-col gap-3 hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                  <FileText className="h-5 w-5" />
                </span>
                {service.category && (
                  <span className="rounded-full bg-surface-bg px-2.5 py-1 text-xs font-medium text-ink-muted">
                    {service.category.name}
                  </span>
                )}
              </div>
              <h2 className="text-base font-semibold text-ink">{service.name}</h2>
              {service.short_description && (
                <p className="text-sm text-ink-muted line-clamp-2">{service.short_description}</p>
              )}
              <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <Banknote className="h-3.5 w-3.5" />
                  {service.fee > 0 ? `₦${service.fee.toLocaleString()}` : "Free"}
                </span>
                {service.estimated_processing_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    ~{service.estimated_processing_minutes} min
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 font-medium text-brand-green">
                  Details <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
