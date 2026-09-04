"use client";

import { useEffect, useState } from "react";
import { Building, Phone, MapPin as MapPinIcon } from "lucide-react";
import { publicContentService } from "@/services/contentService";
import type { Facility } from "@/types/content";

const TYPE_LABELS: Record<string, string> = {
  government_office: "Government Office",
  school: "School",
  health_facility: "Health Facility",
  market: "Market",
  community_facility: "Community Facility",
  other: "Other",
};

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[] | null>(null);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    publicContentService.facilities(typeFilter ? { type: typeFilter } : undefined).then(setFacilities);
  }, [typeFilter]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Public facilities</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">Government offices, schools, health centers, and markets.</p>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
        >
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {facilities?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <Building className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No facilities found</p>
        </div>
      )}

      {facilities && facilities.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <div key={f.id} className="card">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <Building className="h-4 w-4" />
              </span>
              <p className="mt-2 text-sm font-semibold text-ink">{f.name}</p>
              <p className="text-xs text-ink-muted">{TYPE_LABELS[f.type] ?? f.type}</p>
              {f.address && (
                <p className="mt-2 flex items-start gap-1 text-xs text-ink-muted">
                  <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {f.address}
                </p>
              )}
              {f.phone && (
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                  <Phone className="h-3.5 w-3.5" /> {f.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
