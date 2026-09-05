"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { publicDiscoverService } from "@/services/discoverService";
import type { HistoricalRecord } from "@/types/discover";

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoricalRecord[] | null>(null);

  useEffect(() => {
    publicDiscoverService.history().then(setRecords);
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">History of Wase</h1>
      <p className="mt-2 text-sm text-ink-muted">From early settlement to the present day.</p>

      {records?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <BookOpen className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No historical records published yet</p>
        </div>
      )}

      {records && records.length > 0 && (
        <ol className="mt-10 space-y-10 border-l-2 border-brand-light-green pl-6">
          {records.map((record) => (
            <li key={record.id} className="relative">
              <span className="absolute -left-[calc(1.5rem+5px)] top-1 h-3 w-3 rounded-full border-2 border-brand-green bg-white" />
              {record.period_label && (
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-green">
                  {record.period_label}
                </span>
              )}
              <h2 className="mt-1 text-lg font-semibold text-ink">{record.title}</h2>
              {record.summary && <p className="mt-1 text-sm text-ink-muted">{record.summary}</p>}
              <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">{record.content}</p>
              {record.sources && record.sources.length > 0 && (
                <p className="mt-2 text-xs text-ink-muted/70">Sources: {record.sources.join(", ")}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}