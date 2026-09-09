import Link from "next/link";
import { Building2, Users, MapPinned, Landmark, HardHat } from "lucide-react";

// The "Government" nav link (see app/(public)/layout.tsx) had no
// page behind it at all — every other top-nav item (Services,
// Discover Wase, News, Contact) has a real page or hub, but this one
// 404'd. Built to match the /discover hub's pattern, linking out to
// the government-related pages that already exist individually.
const SECTIONS = [
  { href: "/departments", label: "Departments", description: "Departments of Wase Local Government.", icon: Building2 },
  { href: "/leadership", label: "Leadership", description: "Current government leadership of Wase LGA.", icon: Users },
  { href: "/wards", label: "Wards", description: "The administrative wards of Wase Local Government Area.", icon: MapPinned },
  { href: "/facilities", label: "Public facilities", description: "Government offices, schools, health centers, and markets.", icon: Landmark },
  { href: "/projects", label: "Development projects", description: "Ongoing and completed projects across Wase LGA.", icon: HardHat },
];

export default function GovernmentPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Government</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Departments, leadership, wards, and public facilities of Wase Local Government Area.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="card hover:shadow-md">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">{label}</p>
            <p className="mt-1 text-xs text-ink-muted">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
