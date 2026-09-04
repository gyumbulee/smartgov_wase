"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Home } from "lucide-react";
import { publicContentService } from "@/services/contentService";

interface WardDetail {
  id: string;
  name: string;
  description: string | null;
  communities: { id: string; name: string; slug: string; description: string | null }[];
}

export default function WardDetailPage() {
  const params = useParams<{ slug: string }>();
  const [ward, setWard] = useState<WardDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicContentService
      .wardBySlug(params.slug)
      .then((data) => setWard(data as WardDetail))
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-ink-muted">Ward not found.</p>
        <Link href="/wards" className="mt-4 inline-block text-sm font-medium text-brand-green hover:underline">
          Back to wards
        </Link>
      </section>
    );
  }

  if (!ward) {
    return <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6"><p className="text-sm text-ink-muted">Loading…</p></section>;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
        <MapPin className="h-5 w-5" />
      </span>
      <h1 className="mt-3 text-2xl font-semibold text-ink">{ward.name}</h1>
      {ward.description && <p className="mt-2 text-sm text-ink-muted">{ward.description}</p>}

      <div className="mt-8 border-t border-black/5 pt-6">
        <h2 className="text-sm font-semibold text-ink">Communities</h2>
        <div className="mt-3 space-y-2">
          {ward.communities.map((c) => (
            <div key={c.id} className="card flex items-center gap-3 py-3">
              <Home className="h-4 w-4 text-brand-green" />
              <div>
                <p className="text-sm font-medium text-ink">{c.name}</p>
                {c.description && <p className="text-xs text-ink-muted">{c.description}</p>}
              </div>
            </div>
          ))}
          {ward.communities.length === 0 && (
            <p className="text-sm text-ink-muted">No communities listed for this ward yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
