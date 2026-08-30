import Link from "next/link";
import {
  FileText,
  Contact,
  Home as HomeIcon,
  ScrollText,
  Baby,
  Stamp,
  ArrowRight,
  MapPin,
  Users,
  Building2,
  Landmark,
} from "lucide-react";

// NOTE: "Wase at a Glance" figures below are placeholder/demo values.
// Per project principle, no fabricated official statistics may ship to
// production without a cited source + year (spec §49).
const QUICK_SERVICES = [
  { icon: Baby, label: "Birth Certificate", href: "/services/birth-certificate" },
  { icon: ScrollText, label: "Indigene Certificate", href: "/services/indigene-certificate" },
  { icon: HomeIcon, label: "Residency Certificate", href: "/services/residency-certificate" },
  { icon: Stamp, label: "Death Certificate", href: "/services/death-certificate" },
  { icon: Contact, label: "Identification", href: "/services/identification" },
  { icon: FileText, label: "Attestation", href: "/services/attestation" },
];

const GLANCE_STATS = [
  { icon: MapPin, label: "Wards", value: "—", source: "Pending official figures" },
  { icon: Users, label: "Communities", value: "—", source: "Pending official figures" },
  { icon: Building2, label: "Government Services", value: "—", source: "Pending official figures" },
  { icon: Landmark, label: "Tourist Attractions", value: "—", source: "Pending official figures" },
];

export default function HomePage() {
  return (
    <>
      {/* HERO — thesis: government + community + a specific place, not a generic gradient banner */}
      <section className="relative overflow-hidden bg-brand-deep-green">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(11,122,59,0.55),_transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-light-green">
            Wase Local Government Area · Plateau State
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Connecting government, communities &amp; citizens.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Apply for certificates, track civic requests, and explore the
            history, culture and people of Wase — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/services" className="btn-primary bg-white text-brand-deep-green hover:bg-brand-light-green">
              Access government services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Explore Wase
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK SERVICES */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-ink">Quick services</h2>
          <Link href="/services" className="text-sm font-medium text-brand-green hover:underline">
            View all services
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_SERVICES.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="card flex flex-col items-center gap-3 text-center transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* WASE AT A GLANCE */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-semibold text-ink">Wase at a glance</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Figures are published once verified against official sources.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {GLANCE_STATS.map(({ icon: Icon, label, value, source }) => (
              <div key={label} className="card">
                <Icon className="h-5 w-5 text-brand-green" />
                <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
                <p className="text-sm text-ink-muted">{label}</p>
                <p className="mt-1 text-xs text-ink-muted/70">{source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCOVER WASE TEASER */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-ink">Discover Wase</h2>
            <p className="mt-2 max-w-md text-sm text-ink-muted">
              Tourism, history, culture and the people who have shaped Wase —
              a growing digital archive for residents and visitors alike.
            </p>
            <Link href="/discover" className="btn-secondary mt-6 inline-flex">
              Start exploring
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card aspect-[4/3] bg-brand-light-green" />
            <div className="card aspect-[4/3] bg-brand-light-green" />
          </div>
        </div>
      </section>
    </>
  );
}
