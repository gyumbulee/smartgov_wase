"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { adminOversightService } from "@/services/adminOversightService";
import type { AdminCitizen } from "@/types/admin";

export default function AdminCitizensPage() {
  const [citizens, setCitizens] = useState<AdminCitizen[] | null>(null);
  const [search, setSearch] = useState("");

  function refresh(term?: string) {
    adminOversightService.listCitizens(term).then(setCitizens);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Citizens</h1>
      <p className="mt-1 text-sm text-ink-muted">Read-only oversight — identity data only ever comes from verified NIN.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          refresh(search);
        }}
        className="mt-4 flex max-w-sm gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or reference…"
          className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
        <button type="submit" className="btn-secondary">
          <Search className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Citizen</th>
              <th className="px-4 py-3">Ward / Community</th>
              <th className="px-4 py-3">Identity</th>
              <th className="px-4 py-3">Eligibility</th>
              <th className="px-4 py-3">Applications</th>
            </tr>
          </thead>
          <tbody>
            {citizens?.map((citizen) => (
              <tr key={citizen.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{citizen.full_name}</p>
                  <p className="text-xs text-ink-muted">{citizen.citizen_reference}</p>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {citizen.ward ?? "—"}{citizen.community ? ` / ${citizen.community}` : ""}
                </td>
                <td className="px-4 py-3">
                  <StatusPill value={citizen.identity_status} />
                </td>
                <td className="px-4 py-3">
                  <StatusPill value={citizen.eligibility_status} />
                </td>
                <td className="px-4 py-3 text-ink">{citizen.applications_count}</td>
              </tr>
            ))}
            {citizens?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-muted">
                  <Users className="mx-auto mb-2 h-6 w-6 text-ink-muted" />
                  No citizens found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const positive = value === "verified";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        positive ? "bg-brand-light-green text-brand-deep-green" : "bg-surface-bg text-ink-muted"
      }`}
    >
      {value}
    </span>
  );
}
