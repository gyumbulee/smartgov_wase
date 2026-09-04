"use client";

import Link from "next/link";
import { LayoutDashboard, FileText, Bell, LogOut, Banknote, Award } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "My applications", icon: FileText },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/payments", label: "Payments", icon: Banknote },
];

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-bg">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-green text-sm font-bold text-white">
              SW
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink">
              SmartGov<span className="text-brand-green">-Wase</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand-green"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <Bell className="h-4 w-4 text-ink-muted" />
            <Link
              href="/login"
              onClick={() => window.localStorage.removeItem("smartgov_token")}
              className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
