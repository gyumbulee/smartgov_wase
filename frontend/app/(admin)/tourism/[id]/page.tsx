"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { adminDiscoverService } from "@/services/discoverService";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { TouristAttraction } from "@/types/discover";

export default function AdminAttractionDetailPage() {
  const params = useParams<{ id: string }>();
  const [attraction, setAttraction] = useState<TouristAttraction | null>(null);
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState("");
  const [directions, setDirections] = useState("");
  const [visitorInfo, setVisitorInfo] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    adminDiscoverService.getAttraction(params.id).then((a) => {
      setAttraction(a);
      setDescription(a.description ?? "");
      setHistory(a.history ?? "");
      setDirections(a.directions ?? "");
      setVisitorInfo(a.visitor_information ?? "");
      setLatitude(a.latitude?.toString() ?? "");
      setLongitude(a.longitude?.toString() ?? "");
    });
  }
  useEffect(refresh, [params.id]);

  async function handleSaveDetails() {
    if (!attraction) return;
    setSaving(true);
    try {
      await adminDiscoverService.updateAttraction(attraction.id, {
        description,
        history,
        directions,
        visitor_information: visitorInfo,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      });
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!attraction) return;
    await adminDiscoverService.updateAttraction(attraction.id, { status: "published" });
    refresh();
  }

  async function handleAddPhoto(mediaId: string | null) {
    if (!attraction || !mediaId) return;
    await adminDiscoverService.attachAttractionMedia(attraction.id, mediaId);
    refresh();
  }

  async function handleRemovePhoto(mediaId: string) {
    if (!attraction) return;
    await adminDiscoverService.detachAttractionMedia(attraction.id, mediaId);
    refresh();
  }

  if (!attraction) return <p className="text-sm text-ink-muted">Loading…</p>;

  return (
    <div>
      <Link href="/admin/tourism" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to tourism
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{attraction.name}</h1>
          <p className="text-sm text-ink-muted">{attraction.category?.name ?? "Uncategorized"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-brand-light-green px-3 py-1 text-xs font-medium text-brand-deep-green">
            {attraction.status}
          </span>
          {attraction.status !== "published" && (
            <button onClick={handlePublish} className="btn-secondary">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Photo gallery — the core of this page per spec §74.6 */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Photo gallery</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {attraction.gallery.map((img) => (
            <div key={img.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt_text ?? ""} className="h-28 w-full rounded-md object-cover" />
              <button
                onClick={() => handleRemovePhoto(img.id)}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <ImageUploadField label="" onChange={handleAddPhoto} />
        </div>
      </div>

      {/* Details */}
      <div className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold text-ink">Details</h2>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">History</label>
          <textarea
            value={history}
            onChange={(e) => setHistory(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">How to get there</label>
          <textarea
            value={directions}
            onChange={(e) => setDirections(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Visitor information</label>
          <textarea
            value={visitorInfo}
            onChange={(e) => setVisitorInfo(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={latitude}
            onChange={(e) => setLatitude(e.target.value.replace(/[^0-9.\-]/g, ""))}
            placeholder="Latitude"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={longitude}
            onChange={(e) => setLongitude(e.target.value.replace(/[^0-9.\-]/g, ""))}
            placeholder="Longitude"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
        </div>
        <button onClick={handleSaveDetails} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save details"}
        </button>
      </div>
    </div>
  );
}