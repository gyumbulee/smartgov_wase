"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Building2, Newspaper } from "lucide-react";
import { api } from "@/lib/api";

interface Stats {
  citizens: number;
  applications: number;
  projects: number;
  news: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/admin/dashboard").then((res) => setStats(res.data));
  }, []);

  const cards = [
    { label: "Citizens", value: stats?.citizens, icon: Users },
    { label: "Applications", value: stats?.applications, icon: FileText },
    { label: "Projects", value: stats?.projects, icon: Building2 },
    { label: "News articles", value: stats?.news, icon: Newspaper },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">Platform overview.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card">
            <Icon className="h-5 w-5 text-brand-green" />
            <p className="mt-3 text-2xl font-semibold text-ink">{value ?? "—"}</p>
            <p className="text-sm text-ink-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
