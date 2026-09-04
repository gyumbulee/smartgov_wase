"use client";

import { useEffect, useState } from "react";
import { UserSquare2 } from "lucide-react";
import { publicContentService } from "@/services/contentService";
import type { LeadershipProfile } from "@/types/content";

export default function LeadershipPage() {
  const [leaders, setLeaders] = useState<LeadershipProfile[] | null>(null);

  useEffect(() => {
    publicContentService.leadership().then(setLeaders);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Leadership</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Current government leadership of Wase LGA.</p>

      {leaders?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <UserSquare2 className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No leadership profiles published yet</p>
        </div>
      )}

      {leaders && leaders.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => (
            <div key={leader.id} className="card">
              {leader.photo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={leader.photo_url} alt={leader.name} className="h-32 w-full rounded-md object-cover" />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-md bg-brand-light-green text-brand-green">
                  <UserSquare2 className="h-10 w-10" />
                </div>
              )}
              <p className="mt-3 text-sm font-semibold text-ink">{leader.name}</p>
              <p className="text-xs text-ink-muted">{leader.position}</p>
              {leader.short_bio && <p className="mt-2 text-xs text-ink-muted">{leader.short_bio}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
