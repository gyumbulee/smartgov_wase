"use client";

import Link from "next/link";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-bg">
      <aside className="hidden w-60 shrink-0 border-r border-black/5 bg-brand-deep-green text-white md:block">
        <div className="flex h-16 items-center gap-2 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-brand-deep-green">
            SW
          </span>
          <span className="text-sm font-semibold">SmartGov Admin</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-60 border-t border-white/10 p-3">
          <Link
            href="/login"
            onClick={() => window.localStorage.removeItem("smartgov_token")}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Link>
        </div>
      </aside>
      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
