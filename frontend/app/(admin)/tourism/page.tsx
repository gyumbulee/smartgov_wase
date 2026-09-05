"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, MapPin } from "lucide-react";
import { adminDiscoverService } from "@/services/discoverService";
import type { TourismCategory, TouristAttraction } from "@/types/discover";

export default function AdminTourismPage() {
  const [attractions, setAttractions] = useState<TouristAttraction[] | null>(null);
  const [categories, setCategories] = useState<TourismCategory[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateAttraction, setShowCreateAttraction] = useState(false);

  function refresh() {
    adminDiscoverService.listAttractions().then(setAttractions);
    adminDiscoverService.listTourismCategories().then(setCategories);
  }
  useEffect(refresh, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Tourism</h1>
          <p className="mt-1 text-sm text-ink-muted">Attractions, categories, and photo galleries.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateCategory(true)} className="btn-secondary">
            <Plus className="mr-2 h-4 w-4" />
            Category
          </button>
          <button onClick={() => setShowCreateAttraction(true)} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Attraction
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <span key={c.id} className="rounded-full bg-surface-bg px-3 py-1 text-xs text-ink-muted">
            {c.name} ({c.attractions_count ?? 0})
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {attractions?.map((a) => (
          <Link key={a.id} href={`/admin/tourism/${a.id}`} className="card hover:shadow-md">
            {a.gallery[0] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={a.gallery[0].url} alt="" className="-mx-5 -mt-5 mb-3 h-32 w-[calc(100%+2.5rem)] object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <MapPin className="h-4 w-4" />
              </span>
            )}
            <p className="mt-2 text-sm font-semibold text-ink">{a.name}</p>
            <p className="text-xs text-ink-muted">{a.category?.name ?? "Uncategorized"} · {a.status}</p>
            <p className="mt-1 text-xs text-ink-muted">{a.gallery.length} photo{a.gallery.length === 1 ? "" : "s"}</p>
          </Link>
        ))}
        {attractions?.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No attractions yet.
          </p>
        )}
      </div>

      {showCreateCategory && (
        <CreateCategoryModal onClose={() => setShowCreateCategory(false)} onCreated={refresh} />
      )}
      {showCreateAttraction && (
        <CreateAttractionModal
          categories={categories}
          onClose={() => setShowCreateAttraction(false)}
          onCreated={refresh}
        />
      )}
    </div>
  );
}

function CreateCategoryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminDiscoverService.createTourismCategory({ name });
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">New category</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Natural Attractions"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Creating…" : "Create category"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateAttractionModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: TourismCategory[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminDiscoverService.createAttraction({
        name,
        category_id: categoryId || undefined,
        short_description: shortDescription || null,
      });
      onCreated();
      onClose();
    } catch {
      setError("Couldn't create attraction.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">New attraction</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Attraction name"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Short description (optional)"
            rows={3}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Creating…" : "Create as draft"}
          </button>
          <p className="text-xs text-ink-muted">Add photos, directions and full details from the attraction page next.</p>
        </form>
      </div>
    </div>
  );
}