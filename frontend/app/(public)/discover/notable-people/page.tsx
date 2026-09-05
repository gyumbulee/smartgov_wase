"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { publicDiscoverService } from "@/services/discoverService";
import type { NotablePerson } from "@/types/discover";

export default function NotablePeoplePage() {
  const [people, setPeople] = useState<NotablePerson[] | null>(null);

  useEffect(() => {
    publicDiscoverService.notablePeople().then(setPeople);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">People Worth Knowing</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Figures who have shaped Wase — verified profiles only.</p>

      {people?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <UserRound className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No profiles published yet</p>
        </div>
      )}

      {people && people.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {people.map((p) => (
            <Link key={p.id} href={`/discover/notable-people/${p.slug}`} className="text-center">
              {p.photo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.photo_url} alt={p.name} className="mx-auto h-28 w-28 rounded-full object-cover" />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                  <UserRound className="h-10 w-10" />
                </div>
              )}
              <p className="mt-3 text-sm font-semibold text-ink">{p.name}</p>
              {p.category && <p className="text-xs text-ink-muted">{p.category.name}</p>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}