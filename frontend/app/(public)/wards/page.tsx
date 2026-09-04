"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { publicContentService } from "@/services/contentService";
import type { Ward } from "@/types/content";

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[] | null>(null);

  useEffect(() => {
    publicContentService.wards().then(setWards);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Wards</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">The administrative wards of Wase Local Government Area.</p>

      {wards?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <MapPin className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No wards published yet</p>
        </div>
      )}

      {wards && wards.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wards.map((ward) => (
            <Link key={ward.id} href={`/wards/${ward.slug}`} className="card hover:shadow-md">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <MapPin className="h-4 w-4" />
              </span>
              <p className="mt-2 text-sm font-semibold text-ink">{ward.name}</p>
              <p className="text-xs text-ink-muted">{ward.communities_count ?? 0} communities</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
