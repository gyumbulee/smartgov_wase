"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil, Building } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { Facility } from "@/types/content";

const FACILITY_TYPES = ["government_office", "school", "health_facility", "market", "community_facility", "other"] as const;

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[] | null>(null);
  const [editing, setEditing] = useState<Facility | "new" | null>(null);

  function refresh() {
    adminContentService.listFacilities().then(setFacilities);
  }
  useEffect(refresh, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this facility?")) return;
    await adminContentService.deleteFacility(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Facilities</h1>
          <p className="mt-1 text-sm text-ink-muted">Public facilities — offices, schools, health centers, markets.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New facility
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities?.map((f) => (
          <div key={f.id} className="card">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
              <Building className="h-4 w-4" />
            </span>
            <p className="mt-2 text-sm font-semibold text-ink">{f.name}</p>
            <p className="text-xs text-ink-muted">{f.type.replace("_", " ")}</p>
            {f.ward && <p className="text-xs text-ink-muted">{f.ward}</p>}
            <div className="mt-3 flex items-center gap-3">
              <button onClick={() => setEditing(f)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(f.id)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {facilities?.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No facilities yet.
          </p>
        )}
      </div>

      {editing && (
        <FacilityModal
          facility={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function FacilityModal({
  facility,
  onClose,
  onSaved,
}: {
  facility: Facility | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(facility?.name ?? "");
  const [type, setType] = useState<Facility["type"]>(facility?.type ?? "government_office");
  const [address, setAddress] = useState(facility?.address ?? "");
  const [phone, setPhone] = useState(facility?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name, type, address: address || null, phone: phone || null };
      if (facility) {
        await adminContentService.updateFacility(facility.id, payload);
      } else {
        await adminContentService.createFacility(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this facility.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{facility ? "Edit facility" : "New facility"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Facility name"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Facility["type"])}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </select>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save facility"}
          </button>
        </form>
      </div>
    </div>
  );
}
