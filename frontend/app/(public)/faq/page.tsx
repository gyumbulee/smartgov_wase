"use client";

import { useEffect, useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { publicCivicService } from "@/services/civicService";
import type { Faq } from "@/types/civic";

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    publicCivicService.faqs().then(setFaqs);
  }, []);

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Frequently asked questions</h1>
      <p className="mt-2 text-sm text-ink-muted">Common questions about SmartGov-Wase and government services.</p>

      {faqs?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <HelpCircle className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No FAQs published yet</p>
        </div>
      )}

      {faqs && faqs.length > 0 && (
        <div className="mt-8 space-y-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="card">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-ink">{faq.question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${openId === faq.id ? "rotate-180" : ""}`} />
              </button>
              {openId === faq.id && (
                <p className="mt-3 border-t border-black/5 pt-3 text-sm text-ink-muted">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
