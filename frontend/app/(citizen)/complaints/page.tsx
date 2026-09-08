"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, MessageSquareWarning } from "lucide-react";
import { citizenCivicService, publicCivicService } from "@/services/civicService";
import type { Complaint, ComplaintCategory } from "@/types/civic";

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-surface-bg text-ink-muted",
  received: "bg-blue-50 text-blue-700",
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-brand-light-green text-brand-deep-green",
  closed: "bg-surface-bg text-ink-muted",
  rejected: "bg-red-50 text-red-700",
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  function refresh() {
    citizenCivicService.listComplaints().then(setComplaints);
  }
  useEffect(refresh, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">My complaints</h1>
          <p className="mt-1 text-sm text-ink-muted">Report issues like roads, drainage, waste, or streetlights.</p>
        </div>
        <button onClick={() => setShowSubmit(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Report an issue
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {complaints?.map((c) => (
          <Link key={c.id} href={`/complaints/${c.id}`} className="card flex items-center justify-between hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <MessageSquareWarning className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{c.title}</p>
                <p className="text-xs text-ink-muted">{c.complaint_reference} · {c.category?.name}</p>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[c.status] ?? ""}`}>
              {c.status.replace("_", " ")}
            </span>
          </Link>
        ))}
        {complaints?.length === 0 && (
          <div className="flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
            <MessageSquareWarning className="h-8 w-8 text-ink-muted" />
            <p className="mt-3 text-sm font-medium text-ink">No complaints filed yet</p>
          </div>
        )}
      </div>

      {showSubmit && (
        <SubmitComplaintModal
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => { setShowSubmit(false); refresh(); }}
        />
      )}
    </div>
  );
}

function SubmitComplaintModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicCivicService.complaintCategories().then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await citizenCivicService.submitComplaint({
        category_id: categoryId,
        title,
        description,
        location: location || undefined,
      });
      onSubmitted();
    } catch {
      setError("Couldn't submit your complaint. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Report an issue</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            <option value="">Select a category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue"
            required
            rows={4}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Submitting…" : "Submit complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}
