"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/government", label: "Government" },
  { href: "/discover", label: "Discover Wase" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // This header previously always showed "Log in / Get started",
  // regardless of whether the person browsing was already
  // authenticated — so a logged-in citizen or admin clicking any
  // public nav link (Services, Government, Discover, News, Contact)
  // saw what looked like a logged-out header, even though their
  // session/token was completely untouched. smartgov_roles is set
  // alongside smartgov_token at login/registration specifically so
  // this check doesn't need an extra API call.
  const [dashboardHref, setDashboardHref] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("smartgov_token");
    if (!token) return;

    try {
      const roles: string[] = JSON.parse(window.localStorage.getItem("smartgov_roles") ?? "[]");
      setDashboardHref(roles.includes("citizen") ? "/dashboard" : "/admin/dashboard");
    } catch {
      // Roles weren't stored (e.g. a token from before this check
      // existed) — fall back to the citizen dashboard rather than
      // showing a broken/missing link.
      setDashboardHref("/dashboard");
    }
  }, []);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-green text-sm font-bold text-white">
              SW
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink">
              SmartGov<span className="text-brand-green">-Wase</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-green"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {dashboardHref ? (
              <Link href={dashboardHref} className="btn-primary flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                My dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-ink-muted hover:text-brand-green">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-sm font-semibold text-ink">SmartGov-Wase</span>
              <p className="mt-2 text-sm text-ink-muted">
                The digital gateway to Wase Local Government Area, Plateau State.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Government</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/leadership" className="text-ink-muted hover:text-brand-green">Leadership</Link></li>
                <li><Link href="/departments" className="text-ink-muted hover:text-brand-green">Departments</Link></li>
                <li><Link href="/projects" className="text-ink-muted hover:text-brand-green">Projects</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Discover Wase</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/discover/tourism" className="text-ink-muted hover:text-brand-green">Tourism</Link></li>
                <li><Link href="/discover/history" className="text-ink-muted hover:text-brand-green">History</Link></li>
                <li><Link href="/discover/notable-people" className="text-ink-muted hover:text-brand-green">Notable People</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Resources</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/verify-certificate" className="text-ink-muted hover:text-brand-green">Verify a certificate</Link></li>
                <li><Link href="/documents" className="text-ink-muted hover:text-brand-green">Document library</Link></li>
                <li><Link href="/faq" className="text-ink-muted hover:text-brand-green">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <p className="mt-8 border-t border-black/5 pt-6 text-xs text-ink-muted">
            © {new Date().getFullYear()} Wase Local Government Area, Plateau State. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
