"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil, CalendarPlus } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { LeadershipProfile } from "@/types/content";

export default function AdminLeadershipPage() {
  const [leaders, setLeaders] = useState<LeadershipProfile[] | null>(null);
  const [editing, setEditing] = useState<LeadershipProfile | "new" | null>(null);
  const [addingTermFor, setAddingTermFor] = useState<LeadershipProfile | null>(null);

  function refresh() {
    adminContentService.listLeadership().then(setLeaders);
  }
  useEffect(refresh, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this leadership profile?")) return;
    await adminContentService.deleteLeader(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Leadership</h1>
          <p className="mt-1 text-sm text-ink-muted">Current and historical leadership profiles.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New profile
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {leaders?.map((leader) => (
          <div key={leader.id} className="card">
            <p className="text-sm font-semibold text-ink">{leader.name}</p>
            <p className="text-xs text-ink-muted">{leader.position}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {leader.terms.find((t) => t.is_current) ? "Current term" : "No current term"}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button onClick={() => setEditing(leader)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setAddingTermFor(leader)} className="text-ink-muted hover:text-brand-green">
                <CalendarPlus className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(leader.id)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {leaders?.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No leadership profiles yet.
          </p>
        )}
      </div>

      {editing && (
        <LeaderModal
          leader={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}

      {addingTermFor && (
        <TermModal
          leader={addingTermFor}
          onClose={() => setAddingTermFor(null)}
          onSaved={() => { setAddingTermFor(null); refresh(); }}
        />
      )}
    </div>
  );
}

function LeaderModal({
  leader,
  onClose,
  onSaved,
}: {
  leader: LeadershipProfile | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(leader?.name ?? "");
  const [position, setPosition] = useState(leader?.position ?? "");
  const [shortBio, setShortBio] = useState(leader?.short_bio ?? "");
  const [biography, setBiography] = useState(leader?.biography ?? "");
  const [status, setStatus] = useState(leader?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name, position, short_bio: shortBio || null, biography: biography || null, status };
      if (leader) {
        await adminContentService.updateLeader(leader.id, payload);
      } else {
        await adminContentService.createLeader(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{leader ? "Edit profile" : "New leadership profile"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Position"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={shortBio}
            onChange={(e) => setShortBio(e.target.value)}
            placeholder="Short bio (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            placeholder="Full biography (optional)"
            rows={4}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadershipProfile["status"])}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

function TermModal({
  leader,
  onClose,
  onSaved,
}: {
  leader: LeadershipProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminContentService.addLeadershipTerm(leader.id, {
        start_date: startDate,
        end_date: endDate || null,
        is_current: isCurrent,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Add term — {leader.name}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End date (leave blank if ongoing)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} />
            This is the current term
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Add term"}
          </button>
        </form>
      </div>
    </div>
  );
}
