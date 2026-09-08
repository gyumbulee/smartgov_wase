"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicDiscoverService } from "@/services/discoverService";
import type { Gallery } from "@/types/discover";

export default function GalleryDetailPage() {
  const params = useParams<{ slug: string }>();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    publicDiscoverService
      .galleryBySlug(params.slug)
      .then(setGallery)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-ink-muted">Gallery not found.</p>
        <Link href="/discover/gallery" className="mt-4 inline-block text-sm font-medium text-brand-green hover:underline">
          Back to galleries
        </Link>
      </section>
    );
  }

  if (!gallery) {
    return <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6"><p className="text-sm text-ink-muted">Loading…</p></section>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">{gallery.title}</h1>
      {gallery.description && <p className="mt-2 max-w-2xl text-sm text-ink-muted">{gallery.description}</p>}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {gallery.images?.map((img) => (
          <button key={img.id} onClick={() => setLightbox(img.url)} className="group overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt_text ?? ""}
              className="h-40 w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
        {(!gallery.images || gallery.images.length === 0) && (
          <p className="col-span-full text-sm text-ink-muted">No photos in this gallery yet.</p>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-md object-contain" />
        </div>
      )}
    </section>
  );
}
