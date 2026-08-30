"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, FileText, Bell, ArrowRight, Banknote } from "lucide-react";
import { api } from "@/lib/api";

interface CitizenDashboardStats {
  identity_status: string;
  eligibility_status: string;
  applications_count: number;
  notifications_count: number;
}

export default function CitizenDashboardPage() {
  const [stats, setStats] = useState<CitizenDashboardStats | null>(null);

  useEffect(() => {
    api.get<CitizenDashboardStats>("/citizen/dashboard").then((res) => setStats(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Here's where things stand with your account.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={ShieldCheck}
          label="Identity"
          value={stats?.identity_status === "verified" ? "Verified" : "Unverified"}
        />
        <StatCard icon={FileText} label="Applications" value={stats?.applications_count ?? "—"} />
        <StatCard icon={Bell} label="Notifications" value={stats?.notifications_count ?? "—"} />
        <StatCard
          icon={Banknote}
          label="Eligibility"
          value={stats?.eligibility_status === "verified" ? "Verified" : "Pending"}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/services" className="card flex items-center justify-between hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-ink">Apply for a service</p>
            <p className="text-xs text-ink-muted">Browse certificates and other government services.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-brand-green" />
        </Link>
        <Link href="/applications" className="card flex items-center justify-between hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-ink">View my applications</p>
            <p className="text-xs text-ink-muted">Track status and continue drafts.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-brand-green" />
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string | number;
}) {
  return (
    <div className="card">
      <Icon className="h-5 w-5 text-brand-green" />
      <p className="mt-3 text-xl font-semibold text-ink">{value}</p>
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}
