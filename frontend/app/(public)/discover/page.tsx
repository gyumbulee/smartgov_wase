import Link from "next/link";
import { Compass, BookOpen, UserRound, Images, Map } from "lucide-react";

const SECTIONS = [
  { href: "/discover/tourism", label: "Tourism", description: "Natural attractions, landmarks, and places to visit.", icon: Compass },
  { href: "/discover/history", label: "History", description: "The story of Wase, from early settlement to today.", icon: BookOpen },
  { href: "/discover/notable-people", label: "Notable People", description: "Figures who have shaped Wase.", icon: UserRound },
  { href: "/discover/gallery", label: "Gallery", description: "Photos from across the community.", icon: Images },
  { href: "/map", label: "Map", description: "Explore attractions, facilities, and projects on the map.", icon: Map },
];

export default function DiscoverPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Discover Wase</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Tourism, history, culture and the people who have shaped Wase Local Government Area.
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
