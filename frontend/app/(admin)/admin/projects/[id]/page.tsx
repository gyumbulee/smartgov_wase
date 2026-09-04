"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { Project } from "@/types/content";

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [showAddUpdate, setShowAddUpdate] = useState(false);

  function refresh() {
    adminContentService.getProject(params.id).then(setProject);
  }
  useEffect(refresh, [params.id]);

  if (!project) return <p className="text-sm text-ink-muted">Loading…</p>;

  return (
    <div>
      <Link href="/admin/projects" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to projects
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{project.name}</h1>
          <p className="text-sm text-ink-muted">{project.ward ?? "No ward set"} · {project.status}</p>
        </div>
        <span className="rounded-full bg-brand-light-green px-3 py-1 text-xs font-medium text-brand-deep-green">
          {project.progress_percentage}% complete
        </span>
      </div>

      {project.description && <p className="mt-4 text-sm text-ink-muted">{project.description}</p>}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Progress updates</h2>
        <button onClick={() => setShowAddUpdate(true)} className="btn-secondary">
          <Plus className="mr-2 h-4 w-4" />
          Add update
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {project.updates.map((u) => (
          <div key={u.id} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">{u.title}</p>
              {u.progress_percentage !== null && (
                <span className="text-xs text-ink-muted">{u.progress_percentage}%</span>
              )}
            </div>
            {u.description && <p className="mt-1 text-xs text-ink-muted">{u.description}</p>}
            {u.published_at && (
              <p className="mt-1 text-xs text-ink-muted/70">{new Date(u.published_at).toLocaleDateString()}</p>
            )}
          </div>
        ))}
        {project.updates.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 py-8 text-center text-sm text-ink-muted">
            No updates posted yet.
          </p>
        )}
      </div>

      {showAddUpdate && (
        <AddUpdateModal
          projectId={project.id}
          onClose={() => setShowAddUpdate(false)}
          onSaved={() => { setShowAddUpdate(false); refresh(); }}
        />
      )}
    </div>
  );
}

function AddUpdateModal({
  projectId,
  onClose,
  onSaved,
}: {
  projectId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminContentService.addProjectUpdate(projectId, {
        title,
        description: description || null,
        progress_percentage: progress ? Number(progress) : null,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-base font-semibold text-ink">Add progress update</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Update title"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={progress}
            onChange={(e) => setProgress(e.target.value.replace(/\D/g, ""))}
            placeholder="Progress % (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Post update"}
          </button>
        </form>
      </div>
    </div>
  );
}
