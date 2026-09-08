"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { publicDiscoverService } from "@/services/discoverService";
import type { TouristAttraction } from "@/types/discover";

export default function TourismPage() {
  const [attractions, setAttractions] = useState<TouristAttraction[] | null>(null);

  useEffect(() => {
    publicDiscoverService.attractions().then(setAttractions);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Tourism</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Natural attractions, landmarks, and places to visit in Wase.</p>

      {attractions?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <Compass className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No attractions published yet</p>
        </div>
      )}

      {attractions && attractions.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {attractions.map((a) => (
            <Link key={a.id} href={`/discover/tourism/${a.slug}`} className="card overflow-hidden hover:shadow-md">
              {a.gallery[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={a.gallery[0].url} alt="" className="-mx-5 -mt-5 mb-3 h-40 w-[calc(100%+2.5rem)] object-cover" />
              ) : (
                <div className="-mx-5 -mt-5 mb-3 flex h-40 w-[calc(100%+2.5rem)] items-center justify-center bg-brand-light-green text-brand-green">
                  <Compass className="h-8 w-8" />
                </div>
              )}
              {a.category && (
                <span className="text-xs font-medium uppercase tracking-wide text-brand-green">{a.category.name}</span>
              )}
              <p className="mt-1 text-sm font-semibold text-ink">{a.name}</p>
              {a.short_description && <p className="mt-1 text-xs text-ink-muted line-clamp-2">{a.short_description}</p>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
