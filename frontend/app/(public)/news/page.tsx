"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { publicContentService } from "@/services/contentService";
import type { NewsArticle } from "@/types/content";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[] | null>(null);

  useEffect(() => {
    publicContentService.news().then(setArticles);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">News</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Official updates from Wase Local Government.</p>

      {articles?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <Newspaper className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No articles published yet</p>
        </div>
      )}

      {articles && articles.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`} className="card flex flex-col gap-2 overflow-hidden hover:shadow-md">
              {article.featured_image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={article.featured_image_url} alt="" className="-mx-5 -mt-5 mb-1 h-40 w-[calc(100%+2.5rem)] object-cover" />
              )}
              {article.category && (
                <span className="text-xs font-medium uppercase tracking-wide text-brand-green">
                  {article.category.name}
                </span>
              )}
              <h2 className="text-base font-semibold text-ink">{article.title}</h2>
              {article.excerpt && <p className="text-sm text-ink-muted line-clamp-3">{article.excerpt}</p>}
              {article.published_at && (
                <p className="mt-auto pt-2 text-xs text-ink-muted">
                  {new Date(article.published_at).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
