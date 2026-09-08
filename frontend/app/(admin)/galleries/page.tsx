"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { adminDiscoverService } from "@/services/discoverService";
import type { Gallery } from "@/types/discover";

export default function AdminGalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function refresh() {
    adminDiscoverService.listGalleries().then(setGalleries);
  }
  useEffect(refresh, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Galleries</h1>
          <p className="mt-1 text-sm text-ink-muted">Curated photo collections — government activities, culture, events.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New gallery
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleries?.map((g) => (
          <Link key={g.id} href={`/admin/galleries/${g.id}`} className="card hover:shadow-md">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
              <ImageIcon className="h-4 w-4" />
            </span>
            <p className="mt-2 text-sm font-semibold text-ink">{g.title}</p>
            <p className="text-xs text-ink-muted">{g.category ?? "Uncategorized"} · {g.status}</p>
          </Link>
        ))}
        {galleries?.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No galleries yet.
          </p>
        )}
      </div>

      {showCreate && <CreateGalleryModal onClose={() => setShowCreate(false)} onCreated={refresh} />}
    </div>
  );
}

function CreateGalleryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminDiscoverService.createGallery({ title, category: category || null });
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
          <h2 className="text-base font-semibold text-ink">New gallery</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Gallery title"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional, e.g. Culture)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Creating…" : "Create gallery"}
          </button>
        </form>
      </div>
    </div>
  );
}
