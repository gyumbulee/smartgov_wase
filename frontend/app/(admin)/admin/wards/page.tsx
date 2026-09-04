"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil, MapPin } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { Ward } from "@/types/content";

export default function AdminWardsPage() {
  const [wards, setWards] = useState<Ward[] | null>(null);
  const [editing, setEditing] = useState<Ward | "new" | null>(null);

  function refresh() {
    adminContentService.listWards().then(setWards);
  }
  useEffect(refresh, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this ward? Only works if it has no communities.")) return;
    try {
      await adminContentService.deleteWard(id);
      refresh();
    } catch {
      alert("Couldn't delete — this ward likely still has communities.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Wards</h1>
          <p className="mt-1 text-sm text-ink-muted">Administrative wards of Wase LGA.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New ward
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wards?.map((ward) => (
          <div key={ward.id} className="card">
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="text-xs text-ink-muted">{ward.communities_count ?? 0} communities</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{ward.name}</p>
            {ward.code && <p className="text-xs text-ink-muted">{ward.code}</p>}
            <div className="mt-3 flex items-center gap-3">
              <button onClick={() => setEditing(ward)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(ward.id)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {wards?.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No wards yet.
          </p>
        )}
      </div>

      {editing && (
        <WardModal
          ward={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function WardModal({ ward, onClose, onSaved }: { ward: Ward | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(ward?.name ?? "");
  const [code, setCode] = useState(ward?.code ?? "");
  const [description, setDescription] = useState(ward?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name, code: code || null, description: description || null };
      if (ward) {
        await adminContentService.updateWard(ward.id, payload);
      } else {
        await adminContentService.createWard(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this ward.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{ward ? "Edit ward" : "New ward"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ward name"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code (optional, e.g. W1)"
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
            {saving ? "Saving…" : "Save ward"}
          </button>
        </form>
      </div>
    </div>
  );
}
