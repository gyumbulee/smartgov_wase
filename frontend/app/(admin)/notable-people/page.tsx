"use client";

import { useEffect, useState } from "react";
import { Plus, X, CheckCircle2, Trash2, Pencil, UserRound } from "lucide-react";
import { adminDiscoverService } from "@/services/discoverService";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { NotablePeopleCategory, NotablePerson } from "@/types/discover";

export default function AdminNotablePeoplePage() {
  const [people, setPeople] = useState<NotablePerson[] | null>(null);
  const [categories, setCategories] = useState<NotablePeopleCategory[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [editing, setEditing] = useState<NotablePerson | "new" | null>(null);

  function refresh() {
    adminDiscoverService.listNotablePeople().then(setPeople);
    adminDiscoverService.listNotablePeopleCategories().then(setCategories);
  }
  useEffect(refresh, []);

  async function handlePublish(id: string) {
    await adminDiscoverService.publishNotablePerson(id);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this profile?")) return;
    await adminDiscoverService.deleteNotablePerson(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Notable people</h1>
          <p className="mt-1 text-sm text-ink-muted">
            No fabricated biographies — every profile goes through review before publishing.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateCategory(true)} className="btn-secondary">
            <Plus className="mr-2 h-4 w-4" />
            Category
          </button>
          <button onClick={() => setEditing("new")} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            New profile
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people?.map((p) => (
          <div key={p.id} className="card">
            {p.photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={p.photo_url} alt={p.name} className="h-28 w-full rounded-md object-cover" />
            ) : (
              <div className="flex h-28 w-full items-center justify-center rounded-md bg-brand-light-green text-brand-green">
                <UserRound className="h-8 w-8" />
              </div>
            )}
            <p className="mt-2 text-sm font-semibold text-ink">{p.name}</p>
            <p className="text-xs text-ink-muted">{p.category?.name ?? "Uncategorized"} · {p.status}</p>
            <div className="mt-3 flex items-center gap-3">
              {p.status !== "published" && (
                <button onClick={() => handlePublish(p.id)} className="text-brand-green hover:underline" title="Publish">
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setEditing(p)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {people?.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No profiles yet.
          </p>
        )}
      </div>

      {showCreateCategory && (
        <CreateCategoryModal onClose={() => setShowCreateCategory(false)} onCreated={refresh} />
      )}
      {editing && (
        <PersonModal
          person={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
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
      await adminDiscoverService.createNotablePeopleCategory({ name });
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
            placeholder="e.g. Traditional Leaders"
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

function PersonModal({
  person,
  categories,
  onClose,
  onSaved,
}: {
  person: NotablePerson | null;
  categories: NotablePeopleCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(person?.name ?? "");
  const [categoryId, setCategoryId] = useState(person?.category?.id ?? "");
  const [shortDescription, setShortDescription] = useState(person?.short_description ?? "");
  const [biography, setBiography] = useState(person?.biography ?? "");
  const [photoMediaId, setPhotoMediaId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        category_id: categoryId || undefined,
        short_description: shortDescription || null,
        biography,
        ...(photoMediaId ? { photo_media_id: photoMediaId } : {}),
      };
      if (person) {
        await adminDiscoverService.updateNotablePerson(person.id, payload);
      } else {
        await adminDiscoverService.createNotablePerson(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this profile. Biography is required.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{person ? "Edit profile" : "New profile"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <ImageUploadField label="Portrait" currentUrl={person?.photo_url} onChange={setPhotoMediaId} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
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
          <input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Known for (short description)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            placeholder="Biography (required)"
            required
            rows={5}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save as draft"}
          </button>
        </form>
      </div>
    </div>
  );
}
