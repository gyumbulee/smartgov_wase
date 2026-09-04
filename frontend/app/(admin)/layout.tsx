"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Banknote,
  Award,
  ClipboardList,
  Users,
  AlertTriangle,
  UserCog,
  History,
  Building2,
  Newspaper,
  Megaphone,
  UserSquare2,
  Construction,
  MapPin,
  Home,
  Building,
  Calendar,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/services", label: "Services", icon: FileText },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/payments", label: "Payments", icon: Banknote },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/leadership", label: "Leadership", icon: UserSquare2 },
  { href: "/admin/projects", label: "Projects", icon: Construction },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/wards", label: "Wards", icon: MapPin },
  { href: "/admin/communities", label: "Communities", icon: Home },
  { href: "/admin/facilities", label: "Facilities", icon: Building },
  { href: "/admin/citizens", label: "Citizens", icon: Users },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/exceptions", label: "Exceptions", icon: AlertTriangle },
  { href: "/admin/users", label: "Staff", icon: UserCog },
  { href: "/admin/audit-logs", label: "Audit log", icon: History },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-bg">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-black/5 bg-brand-deep-green text-white md:flex">
        <div className="flex h-16 shrink-0 items-center gap-2 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-brand-deep-green">
            SW
          </span>
          <span className="text-sm font-semibold">SmartGov Admin</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
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
        <div className="shrink-0 border-t border-white/10 p-3">
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
