"use client";

import { useState } from "react";
import { Upload, X, Loader2, ImageOff } from "lucide-react";
import { api } from "@/lib/api";

interface UploadedMedia {
  id: string;
  url: string;
}

/**
 * Uploads to the public-content media endpoint (POST /admin/media —
 * stores on the 'public' disk, distinct from citizen document storage)
 * and reports back the resulting media id for the parent form to
 * submit as e.g. featured_image_id / photo_media_id.
 */
export function ImageUploadField({
  label,
  currentUrl,
  onChange,
}: {
  label: string;
  currentUrl?: string | null;
  onChange: (mediaId: string | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<{ data: UploadedMedia }>("/admin/media", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(data.data.url);
      onChange(data.data.id);
    } catch {
      setError("Upload failed. Use an image under 5MB.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted">{label}</label>
      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="h-32 w-full rounded-md object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onChange(null);
            }}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-black/15 text-ink-muted hover:border-brand-green hover:text-brand-green">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span className="text-xs">Click to upload image</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-600"><ImageOff className="h-3 w-3" />{error}</p>}
    </div>
  );
}
