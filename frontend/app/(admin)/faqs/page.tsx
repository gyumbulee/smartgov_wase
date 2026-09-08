"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil } from "lucide-react";
import { adminCivicService } from "@/services/civicService";
import type { Faq } from "@/types/civic";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [editing, setEditing] = useState<Faq | "new" | null>(null);

  function refresh() {
    adminCivicService.listFaqs().then(setFaqs);
  }
  useEffect(refresh, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    await adminCivicService.deleteFaq(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">FAQs</h1>
          <p className="mt-1 text-sm text-ink-muted">Frequently asked questions — general or service-specific.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New FAQ
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {faqs?.map((f) => (
          <div key={f.id} className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{f.question}</p>
              <p className="mt-1 text-xs text-ink-muted line-clamp-1">{f.answer}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(f)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(f.id)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {faqs?.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 bg-white py-10 text-center text-sm text-ink-muted">
            No FAQs yet.
          </p>
        )}
      </div>

      {editing && (
        <FaqModal
          faq={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function FaqModal({ faq, onClose, onSaved }: { faq: Faq | null; onClose: () => void; onSaved: () => void }) {
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { question, answer, category: category || null };
      if (faq) {
        await adminCivicService.updateFaq(faq.id, payload);
      } else {
        await adminCivicService.createFaq(payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{faq ? "Edit FAQ" : "New FAQ"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer"
            required
            rows={4}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save FAQ"}
          </button>
        </form>
      </div>
    </div>
  );
}
