"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { Announcement } from "@/types/content";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [editing, setEditing] = useState<Announcement | "new" | null>(null);

  function refresh() {
    adminContentService.listAnnouncements().then(setItems);
  }
  useEffect(refresh, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await adminContentService.deleteAnnouncement(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Announcements</h1>
          <p className="mt-1 text-sm text-ink-muted">Public notices — normal, important, or urgent.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New announcement
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {items?.map((a) => (
          <div key={a.id} className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{a.title}</p>
              <p className="text-xs text-ink-muted">{a.priority} · {a.status}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(a)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(a.id)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {items?.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No announcements yet.
          </p>
        )}
      </div>

      {editing && (
        <AnnouncementModal
          announcement={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function AnnouncementModal({
  announcement,
  onClose,
  onSaved,
}: {
  announcement: Announcement | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [content, setContent] = useState(announcement?.content ?? "");
  const [priority, setPriority] = useState(announcement?.priority ?? "normal");
  const [status, setStatus] = useState(announcement?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { title, content, priority, status };
      if (announcement) {
        await adminContentService.updateAnnouncement(announcement.id, payload);
      } else {
        await adminContentService.createAnnouncement(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this announcement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{announcement ? "Edit announcement" : "New announcement"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            required
            rows={4}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Announcement["priority"])}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Announcement["status"])}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}
