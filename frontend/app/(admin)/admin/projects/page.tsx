"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, Building2 } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { Project } from "@/types/content";

const STATUS_STYLES: Record<string, string> = {
  proposed: "bg-surface-bg text-ink-muted",
  approved: "bg-blue-50 text-blue-700",
  ongoing: "bg-amber-50 text-amber-700",
  completed: "bg-brand-light-green text-brand-deep-green",
  suspended: "bg-red-50 text-red-700",
  cancelled: "bg-surface-bg text-ink-muted",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function refresh() {
    adminContentService.listProjects().then(setProjects);
  }
  useEffect(refresh, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Development projects</h1>
          <p className="mt-1 text-sm text-ink-muted">Track projects and post progress updates.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New project
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((p) => (
          <Link key={p.id} href={`/admin/projects/${p.id}`} className="card hover:shadow-md">
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <Building2 className="h-4 w-4" />
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status] ?? ""}`}>
                {p.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{p.name}</p>
            <p className="text-xs text-ink-muted">{p.ward ?? "No ward set"}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-bg">
              <div className="h-full bg-brand-green" style={{ width: `${p.progress_percentage}%` }} />
            </div>
            <p className="mt-1 text-xs text-ink-muted">{p.progress_percentage}% complete</p>
          </Link>
        ))}
        {projects?.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No projects yet.
          </p>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={refresh} />
      )}
    </div>
  );
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contractor, setContractor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminContentService.createProject({ name, description: description || null, contractor: contractor || null });
      onCreated();
      onClose();
    } catch {
      setError("Couldn't create project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">New project</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
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
            value={contractor}
            onChange={(e) => setContractor(e.target.value)}
            placeholder="Contractor (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Creating…" : "Create as proposed"}
          </button>
        </form>
      </div>
    </div>
  );
}
