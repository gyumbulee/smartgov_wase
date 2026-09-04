"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { publicContentService } from "@/services/contentService";
import type { CivicEvent } from "@/types/content";

export default function EventsPage() {
  const [events, setEvents] = useState<CivicEvent[] | null>(null);

  useEffect(() => {
    publicContentService.events(true).then(setEvents);
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Events</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Upcoming government meetings, workshops, and community events.</p>

      {events?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <Calendar className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No upcoming events</p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="mt-8 space-y-3">
          {events.map((event) => {
            const date = event.event_date ? new Date(event.event_date) : null;
            return (
              <div key={event.id} className="card flex items-center gap-4">
                {date && (
                  <div className="flex w-16 shrink-0 flex-col items-center rounded-md bg-brand-light-green py-2 text-brand-deep-green">
                    <span className="text-xs font-medium uppercase">
                      {date.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                    <span className="text-lg font-semibold">{date.getDate()}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-ink">{event.title}</p>
                  {event.venue && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="h-3.5 w-3.5" /> {event.venue}
                    </p>
                  )}
                  {event.description && <p className="mt-1 text-xs text-ink-muted line-clamp-2">{event.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
