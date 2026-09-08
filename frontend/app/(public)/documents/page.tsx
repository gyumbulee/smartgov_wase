"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Search } from "lucide-react";
import { publicCivicService } from "@/services/civicService";
import type { CivicDocument } from "@/types/civic";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<CivicDocument[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    publicCivicService.documents(search || undefined).then(setDocuments);
  }, [search]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Document library</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Forms, reports, policies, and other public documents.</p>

      <div className="mt-6 flex max-w-sm items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
        <Search className="h-4 w-4 text-ink-muted" />
      </div>

      {documents?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <FileText className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No documents found</p>
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="mt-6 space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{doc.title}</p>
                  {doc.category && <p className="text-xs text-ink-muted">{doc.category}</p>}
                </div>
              </div>
              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-brand-green hover:underline"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
