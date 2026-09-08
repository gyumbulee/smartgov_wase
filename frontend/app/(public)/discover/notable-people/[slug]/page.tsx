"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { publicDiscoverService } from "@/services/discoverService";
import type { NotablePerson } from "@/types/discover";

export default function NotablePersonDetailPage() {
  const params = useParams<{ slug: string }>();
  const [person, setPerson] = useState<NotablePerson | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicDiscoverService
      .notablePersonBySlug(params.slug)
      .then(setPerson)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-ink-muted">Profile not found.</p>
        <Link href="/discover/notable-people" className="mt-4 inline-block text-sm font-medium text-brand-green hover:underline">
          Back to notable people
        </Link>
      </section>
    );
  }

  if (!person) {
    return <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6"><p className="text-sm text-ink-muted">Loading…</p></section>;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-4">
        {person.photo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={person.photo_url} alt={person.name} className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
            <UserRound className="h-10 w-10" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-ink">{person.name}</h1>
          {person.category && <p className="text-sm text-ink-muted">{person.category.name}</p>}
          {person.short_description && <p className="mt-1 text-sm text-ink-muted">{person.short_description}</p>}
        </div>
      </div>

      <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-ink">{person.biography}</div>

      {person.achievements && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Achievements</h2>
          <p className="mt-2 text-sm text-ink-muted">{person.achievements}</p>
        </div>
      )}
      {person.contribution && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Contribution to Wase</h2>
          <p className="mt-2 text-sm text-ink-muted">{person.contribution}</p>
        </div>
      )}
      {person.legacy && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Legacy</h2>
          <p className="mt-2 text-sm text-ink-muted">{person.legacy}</p>
        </div>
      )}
      {person.sources && person.sources.length > 0 && (
        <p className="mt-8 border-t border-black/5 pt-4 text-xs text-ink-muted/70">
          Sources: {person.sources.join(", ")}
        </p>
      )}
    </section>
  );
}
