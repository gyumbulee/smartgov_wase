"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Compass, MapPin, Navigation, Info } from "lucide-react";
import { publicDiscoverService } from "@/services/discoverService";
import type { TouristAttraction } from "@/types/discover";

export default function AttractionDetailPage() {
  const params = useParams<{ slug: string }>();
  const [attraction, setAttraction] = useState<TouristAttraction | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicDiscoverService
      .attractionBySlug(params.slug)
      .then(setAttraction)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-ink-muted">Attraction not found.</p>
        <Link href="/discover/tourism" className="mt-4 inline-block text-sm font-medium text-brand-green hover:underline">
          Back to tourism
        </Link>
      </section>
    );
  }

  if (!attraction) {
    return <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6"><p className="text-sm text-ink-muted">Loading…</p></section>;
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      {attraction.gallery[0] && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={attraction.gallery[0].url} alt="" className="h-72 w-full rounded-card object-cover" />
      )}

      {attraction.category && (
        <span className="mt-6 block text-xs font-medium uppercase tracking-wide text-brand-green">
          {attraction.category.name}
        </span>
      )}
      <h1 className="mt-2 text-2xl font-semibold text-ink">{attraction.name}</h1>
      {attraction.short_description && <p className="mt-2 text-sm text-ink-muted">{attraction.short_description}</p>}

      {attraction.description && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">About</h2>
          <p className="mt-2 text-sm text-ink-muted">{attraction.description}</p>
        </div>
      )}

      {attraction.history && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">History</h2>
          <p className="mt-2 text-sm text-ink-muted">{attraction.history}</p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {attraction.location_description && (
          <div className="card">
            <MapPin className="h-4 w-4 text-brand-green" />
            <p className="mt-2 text-xs font-medium text-ink">Location</p>
            <p className="text-xs text-ink-muted">{attraction.location_description}</p>
          </div>
        )}
        {attraction.directions && (
          <div className="card">
            <Navigation className="h-4 w-4 text-brand-green" />
            <p className="mt-2 text-xs font-medium text-ink">How to get there</p>
            <p className="text-xs text-ink-muted">{attraction.directions}</p>
          </div>
        )}
      </div>

      {attraction.visitor_information && (
        <div className="mt-6 flex items-start gap-2 rounded-card border border-brand-green/20 bg-brand-light-green p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-deep-green" />
          <p className="text-sm text-brand-deep-green">{attraction.visitor_information}</p>
        </div>
      )}

      {attraction.gallery.length > 1 && (
        <div className="mt-8 border-t border-black/5 pt-6">
          <h2 className="text-sm font-semibold text-ink">Gallery</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {attraction.gallery.map((img) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={img.id} src={img.url} alt={img.alt_text ?? ""} className="h-28 w-full rounded-md object-cover" />
            ))}
          </div>
        </div>
      )}

      {attraction.latitude && attraction.longitude && (
        <Link
          href={`/map?lat=${attraction.latitude}&lng=${attraction.longitude}`}
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-green hover:underline"
        >
          <Compass className="h-4 w-4" /> View on map
        </Link>
      )}
    </section>
  );
}
