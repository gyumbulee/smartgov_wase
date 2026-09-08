"use client";

import { useEffect, useState } from "react";
import { Plus, X, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { adminDiscoverService } from "@/services/discoverService";
import type { HistoricalRecord } from "@/types/discover";

export default function AdminHistoryPage() {
  const [records, setRecords] = useState<HistoricalRecord[] | null>(null);
  const [editing, setEditing] = useState<HistoricalRecord | "new" | null>(null);

  function refresh() {
    adminDiscoverService.listHistory().then(setRecords);
  }
  useEffect(refresh, []);

  async function handlePublish(id: string) {
    await adminDiscoverService.publishHistory(id);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this historical record?")) return;
    await adminDiscoverService.deleteHistory(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">History</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Wase's historical archive. Use credible sources and distinguish documented history from oral tradition.
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New record
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {records?.map((r) => (
          <div key={r.id} className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{r.title}</p>
              <p className="text-xs text-ink-muted">
                {r.period_label ?? `${r.period_start ?? "?"} – ${r.period_end ?? "present"}`} · {r.status}
                {!r.sources && <span className="ml-2 text-amber-600">no sources cited</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {r.status !== "published" && (
                <button onClick={() => handlePublish(r.id)} className="text-brand-green hover:underline" title="Publish">
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setEditing(r)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(r.id)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {records?.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No historical records yet.
          </p>
        )}
      </div>

      {editing && (
        <HistoryModal
          record={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function HistoryModal({
  record,
  onClose,
  onSaved,
}: {
  record: HistoricalRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(record?.title ?? "");
  const [periodLabel, setPeriodLabel] = useState(record?.period_label ?? "");
  const [summary, setSummary] = useState(record?.summary ?? "");
  const [content, setContent] = useState(record?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { title, period_label: periodLabel || null, summary: summary || null, content };
      if (record) {
        await adminDiscoverService.updateHistory(record.id, payload);
      } else {
        await adminDiscoverService.createHistory(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{record ? "Edit record" : "New historical record"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title, e.g. 'Colonial Administration Period'"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="Period label, e.g. '1900–1960' (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short summary (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Full content"
            required
            rows={6}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save as draft"}
          </button>
        </form>
      </div>
    </div>
  );
}
