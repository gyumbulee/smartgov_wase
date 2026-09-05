export interface TourismCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  attractions_count?: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt_text: string | null;
  credit: string | null;
  sort_order: number | null;
}

export interface TouristAttraction {
  id: string;
  name: string;
  slug: string;
  category: TourismCategory | null;
  short_description: string | null;
  description: string | null;
  history: string | null;
  cultural_significance: string | null;
  location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  directions: string | null;
  visitor_information: string | null;
  featured: boolean;
  status: "draft" | "published" | "archived";
  gallery: GalleryImage[];
}

export interface HistoricalRecord {
  id: string;
  title: string;
  slug: string;
  period_start: string | null;
  period_end: string | null;
  period_label: string | null;
  summary: string | null;
  content: string;
  location: string | null;
  sources: string[] | null;
  featured: boolean;
  status: "draft" | "published" | "archived";
  published_at: string | null;
}

export interface NotablePeopleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface NotablePerson {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  biography: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  category: NotablePeopleCategory | null;
  community: string | null;
  ward: string | null;
  photo_url: string | null;
  achievements: string | null;
  contribution: string | null;
  legacy: string | null;
  sources: string[] | null;
  status: "draft" | "review" | "published" | "archived";
  published_at: string | null;
}

export interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  status: "draft" | "published";
  images?: { id: string; url: string; caption: string | null; alt_text: string | null }[];
}

export interface MapMarker {
  type: "attraction" | "facility" | "project" | "community";
  name: string;
  slug?: string;
  status?: string;
  facility_type?: string;
  lat: number;
  lng: number;
}