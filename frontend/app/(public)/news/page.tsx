import { Newspaper } from "lucide-react";

// News listing shell — wired to GET /api/v1/public/news once content is published.
export default function NewsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">News</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Official updates from Wase Local Government.
      </p>

      <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
        <Newspaper className="h-8 w-8 text-ink-muted" />
        <p className="mt-3 text-sm font-medium text-ink">No articles published yet</p>
        <p className="mt-1 max-w-sm text-sm text-ink-muted">
          Published news will appear here once content administrators add official updates.
        </p>
      </div>
    </section>
  );
}
