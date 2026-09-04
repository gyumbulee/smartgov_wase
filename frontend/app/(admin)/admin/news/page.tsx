"use client";

import { useEffect, useState } from "react";
import { Plus, X, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { adminContentService } from "@/services/contentService";
import type { NewsArticle, NewsCategory } from "@/types/content";

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[] | null>(null);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [editing, setEditing] = useState<NewsArticle | "new" | null>(null);

  function refresh() {
    adminContentService.listNews().then(setArticles);
  }

  useEffect(() => {
    refresh();
    adminContentService.listNewsCategories().then(setCategories);
  }, []);

  async function handlePublish(id: string) {
    await adminContentService.publishNews(id);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    await adminContentService.deleteNews(id);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">News</h1>
          <p className="mt-1 text-sm text-ink-muted">Official updates — draft, review, then publish.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New article
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles?.map((article) => (
              <tr key={article.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{article.title}</td>
                <td className="px-4 py-3 text-ink-muted">{article.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      article.status === "published"
                        ? "bg-brand-light-green text-brand-deep-green"
                        : "bg-surface-bg text-ink-muted"
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {article.status !== "published" && (
                      <button
                        onClick={() => handlePublish(article.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-green hover:underline"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Publish
                      </button>
                    )}
                    <button onClick={() => setEditing(article)} className="text-ink-muted hover:text-brand-green">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(article.id)} className="text-ink-muted hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {articles?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-muted">No articles yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <NewsModal
          article={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function NewsModal({
  article,
  categories,
  onClose,
  onSaved,
}: {
  article: NewsArticle | null;
  categories: NewsCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [categoryId, setCategoryId] = useState(article?.category?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { title, excerpt: excerpt || null, content, category_id: categoryId || undefined };
      if (article) {
        await adminContentService.updateNews(article.id, payload);
      } else {
        await adminContentService.createNews(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this article.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{article ? "Edit article" : "New article"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Excerpt (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Article content"
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
