"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil, CheckCircle2, Calendar } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { CivicEvent } from "@/types/content";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<CivicEvent[] | null>(null);
  const [editing, setEditing] = useState<CivicEvent | "new" | null>(null);

  function refresh() {
    adminContentService.listEvents().then(setEvents);
  }
  useEffect(refresh, []);

  async function handlePublish(id: string) {
    await adminContentService.publishEvent(id);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    await adminContentService.deleteEvent(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Events</h1>
          <p className="mt-1 text-sm text-ink-muted">Government meetings, public events, workshops.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New event
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {events?.map((e) => (
          <div key={e.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{e.title}</p>
                <p className="text-xs text-ink-muted">
                  {e.event_date ? new Date(e.event_date).toLocaleDateString() : "—"} {e.venue ? `· ${e.venue}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-surface-bg px-2.5 py-1 text-xs font-medium text-ink-muted">{e.status}</span>
              {e.status !== "published" && (
                <button onClick={() => handlePublish(e.id)} className="text-brand-green hover:underline" title="Publish">
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setEditing(e)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(e.id)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {events?.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No events yet.
          </p>
        )}
      </div>

      {editing && (
        <EventModal
          event={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function EventModal({ event, onClose, onSaved }: { event: CivicEvent | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [eventDate, setEventDate] = useState(event?.event_date?.slice(0, 10) ?? "");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [organizer, setOrganizer] = useState(event?.organizer ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        description: description || null,
        event_date: eventDate,
        venue: venue || null,
        organizer: organizer || null,
      };
      if (event) {
        await adminContentService.updateEvent(event.id, payload);
      } else {
        await adminContentService.createEvent(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{event ? "Edit event" : "New event"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Venue (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            placeholder="Organizer (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save event"}
          </button>
        </form>
      </div>
    </div>
  );
}
