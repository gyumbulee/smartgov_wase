"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, FileText } from "lucide-react";
import { adminCivicService } from "@/services/civicService";
import type { CivicDocument } from "@/types/civic";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<CivicDocument[] | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  function refresh() {
    adminCivicService.listDocuments().then(setDocuments);
  }
  useEffect(refresh, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await adminCivicService.deleteDocument(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Document library</h1>
          <p className="mt-1 text-sm text-ink-muted">Forms, reports, policies, and other public documents.</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Upload document
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {documents?.map((d) => (
          <div key={d.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{d.title}</p>
                {d.file_size && (
                  <p className="text-xs text-ink-muted">{(d.file_size / 1024).toFixed(0)} KB</p>
                )}
              </div>
            </div>
            <button onClick={() => handleDelete(d.id)} className="text-ink-muted hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {documents?.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No documents yet.
          </p>
        )}
      </div>

      {showUpload && (
        <UploadDocumentModal onClose={() => setShowUpload(false)} onUploaded={refresh} />
      )}
    </div>
  );
}

function UploadDocumentModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await adminCivicService.uploadDocument({ title, description: description || undefined, file });
      onUploaded();
      onClose();
    } catch {
      setError("Upload failed. Use a PDF, Word, or Excel file under 10MB.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Upload document</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={uploading || !file} className="btn-primary w-full">
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
