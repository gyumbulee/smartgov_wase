"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Images } from "lucide-react";
import { publicDiscoverService } from "@/services/discoverService";
import type { Gallery } from "@/types/discover";

export default function GalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[] | null>(null);

  useEffect(() => {
    publicDiscoverService.galleries().then(setGalleries);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Gallery</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Photos from across Wase — government, culture, community, events.</p>

      {galleries?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <Images className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No galleries published yet</p>
        </div>
      )}

      {galleries && galleries.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g) => (
            <Link key={g.id} href={`/discover/gallery/${g.slug}`} className="card hover:shadow-md">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <Images className="h-4 w-4" />
              </span>
              <p className="mt-2 text-sm font-semibold text-ink">{g.title}</p>
              {g.category && <p className="text-xs text-ink-muted">{g.category}</p>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
