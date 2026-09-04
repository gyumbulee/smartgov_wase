"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Construction } from "lucide-react";
import { publicContentService } from "@/services/contentService";
import type { Project } from "@/types/content";

const STATUS_STYLES: Record<string, string> = {
  proposed: "bg-surface-bg text-ink-muted",
  approved: "bg-blue-50 text-blue-700",
  ongoing: "bg-amber-50 text-amber-700",
  completed: "bg-brand-light-green text-brand-deep-green",
  suspended: "bg-red-50 text-red-700",
  cancelled: "bg-surface-bg text-ink-muted",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    publicContentService.projects().then(setProjects);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Development projects</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Ongoing and completed projects across Wase LGA.</p>

      {projects?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <Construction className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No projects published yet</p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="card hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                  <Construction className="h-4 w-4" />
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[project.status] ?? ""}`}>
                  {project.status}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">{project.name}</p>
              {project.ward && <p className="text-xs text-ink-muted">{project.ward}</p>}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-bg">
                <div className="h-full bg-brand-green" style={{ width: `${project.progress_percentage}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink-muted">{project.progress_percentage}% complete</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
