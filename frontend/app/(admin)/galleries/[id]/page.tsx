"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import { adminDiscoverService } from "@/services/discoverService";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Gallery } from "@/types/discover";

export default function AdminGalleryDetailPage() {
  const params = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<Gallery | null>(null);

  function refresh() {
    adminDiscoverService.getGallery(params.id).then(setGallery);
  }
  useEffect(refresh, [params.id]);

  async function handleAddImage(mediaId: string | null) {
    if (!gallery || !mediaId) return;
    await adminDiscoverService.attachGalleryMedia(gallery.id, mediaId);
    refresh();
  }

  async function handleRemoveImage(mediaId: string) {
    if (!gallery) return;
    await adminDiscoverService.detachGalleryMedia(gallery.id, mediaId);
    refresh();
  }

  async function handlePublish() {
    if (!gallery) return;
    await adminDiscoverService.updateGallery(gallery.id, { status: "published" });
    refresh();
  }

  if (!gallery) return <p className="text-sm text-ink-muted">Loading…</p>;

  return (
    <div>
      <Link href="/admin/galleries" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to galleries
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{gallery.title}</h1>
          <p className="text-sm text-ink-muted">{gallery.category ?? "Uncategorized"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-brand-light-green px-3 py-1 text-xs font-medium text-brand-deep-green">
            {gallery.status}
          </span>
          {gallery.status !== "published" && (
            <button onClick={handlePublish} className="btn-secondary">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {gallery.images?.map((img) => (
          <div key={img.id} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt_text ?? ""} className="h-28 w-full rounded-md object-cover" />
            <button
              onClick={() => handleRemoveImage(img.id)}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <ImageUploadField label="" onChange={handleAddImage} />
      </div>
    </div>
  );
}