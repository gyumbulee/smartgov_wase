"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicContentService } from "@/services/contentService";
import type { NewsArticle } from "@/types/content";

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicContentService
      .newsBySlug(params.slug)
      .then(setArticle)
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-ink-muted">Article not found.</p>
        <Link href="/news" className="mt-4 inline-block text-sm font-medium text-brand-green hover:underline">
          Back to news
        </Link>
      </section>
    );
  }

  if (!article) {
    return <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6"><p className="text-sm text-ink-muted">Loading…</p></section>;
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      {article.featured_image_url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={article.featured_image_url} alt="" className="mb-6 h-64 w-full rounded-card object-cover" />
      )}
      {article.category && (
        <span className="text-xs font-medium uppercase tracking-wide text-brand-green">{article.category.name}</span>
      )}
      <h1 className="mt-2 text-2xl font-semibold text-ink">{article.title}</h1>
      {article.published_at && (
        <p className="mt-2 text-sm text-ink-muted">{new Date(article.published_at).toLocaleDateString()}</p>
      )}
      <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink">{article.content}</div>
    </article>
  );
}
