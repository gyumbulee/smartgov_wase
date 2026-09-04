"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Construction } from "lucide-react";
import { publicContentService } from "@/services/contentService";
import type { Project } from "@/types/content";

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicContentService
      .projectBySlug(params.slug)
      .then(setProject)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-ink-muted">Project not found.</p>
        <Link href="/projects" className="mt-4 inline-block text-sm font-medium text-brand-green hover:underline">
          Back to projects
        </Link>
      </section>
    );
  }

  if (!project) {
    return <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6"><p className="text-sm text-ink-muted">Loading…</p></section>;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
        <Construction className="h-5 w-5" />
      </span>
      <h1 className="mt-3 text-2xl font-semibold text-ink">{project.name}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {project.ward ?? "Wase LGA"} · {project.status}
      </p>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-bg">
        <div className="h-full bg-brand-green" style={{ width: `${project.progress_percentage}%` }} />
      </div>
      <p className="mt-1 text-xs text-ink-muted">{project.progress_percentage}% complete</p>

      {project.description && <p className="mt-6 text-sm text-ink-muted">{project.description}</p>}

      {project.contractor && (
        <p className="mt-4 text-sm text-ink"><span className="text-ink-muted">Contractor:</span> {project.contractor}</p>
      )}

      {project.updates.length > 0 && (
        <div className="mt-8 border-t border-black/5 pt-6">
          <h2 className="text-sm font-semibold text-ink">Updates</h2>
          <ol className="mt-3 space-y-3">
            {project.updates.map((u) => (
              <li key={u.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
                <div>
                  <p className="text-ink">{u.title}</p>
                  {u.description && <p className="text-xs text-ink-muted">{u.description}</p>}
                  {u.published_at && (
                    <p className="text-xs text-ink-muted/70">{new Date(u.published_at).toLocaleDateString()}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
