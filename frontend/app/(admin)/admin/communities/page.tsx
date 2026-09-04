"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil, Home } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { Community, Ward } from "@/types/content";

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[] | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [editing, setEditing] = useState<Community | "new" | null>(null);

  function refresh() {
    adminContentService.listCommunities().then(setCommunities);
  }
  useEffect(() => {
    refresh();
    adminContentService.listWards().then(setWards);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this community?")) return;
    await adminContentService.deleteCommunity(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Communities</h1>
          <p className="mt-1 text-sm text-ink-muted">Communities within each ward.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New community
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Ward</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {communities?.map((c) => (
              <tr key={c.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                <td className="px-4 py-3 text-ink-muted">{c.ward ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-light-green px-2.5 py-1 text-xs font-medium text-brand-deep-green">
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setEditing(c)} className="text-ink-muted hover:text-brand-green">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-ink-muted hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {communities?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-muted">
                  <Home className="mx-auto mb-2 h-6 w-6 text-ink-muted" />
                  No communities yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <CommunityModal
          community={editing === "new" ? null : editing}
          wards={wards}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function CommunityModal({
  community,
  wards,
  onClose,
  onSaved,
}: {
  community: Community | null;
  wards: Ward[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(community?.name ?? "");
  const [wardId, setWardId] = useState("");
  const [description, setDescription] = useState(community?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wardId && !community) {
      setError("Select a ward.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (community) {
        await adminContentService.updateCommunity(community.id, { name, description: description || null, ward_id: wardId || undefined });
      } else {
        await adminContentService.createCommunity({ name, description: description || null, ward_id: wardId });
      }
      onSaved();
    } catch {
      setError("Couldn't save this community.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{community ? "Edit community" : "New community"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Community name"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <select
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            <option value="">{community ? `Keep current ward (${community.ward})` : "Select a ward…"}</option>
            {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save community"}
          </button>
        </form>
      </div>
    </div>
  );
}
