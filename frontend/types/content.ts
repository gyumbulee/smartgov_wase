export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: NewsCategory | null;
  department: string | null;
  author?: string | null;
  featured_image_url?: string | null;
  status: "draft" | "review" | "approved" | "published" | "archived";
  featured: boolean;
  views_count: number;
  published_at: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  status: "draft" | "published" | "expired";
  starts_at: string | null;
  expires_at: string | null;
}

export interface LeadershipTerm {
  id: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface LeadershipProfile {
  id: string;
  name: string;
  slug: string;
  position: string;
  department: string | null;
  biography: string | null;
  short_bio: string | null;
  photo_url?: string | null;
  email: string | null;
  phone: string | null;
  display_order: number;
  status: "draft" | "published" | "archived";
  terms: LeadershipTerm[];
}

export interface ProjectUpdate {
  id: string;
  title: string;
  description: string | null;
  progress_percentage: number | null;
  status: string | null;
  published_at: string | null;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  project_code: string | null;
  description: string | null;
  department: string | null;
  ward: string | null;
  community: string | null;
  location_description: string | null;
  contractor: string | null;
  budget: number | null;
  currency: string | null;
  start_date: string | null;
  expected_completion_date: string | null;
  actual_completion_date: string | null;
  progress_percentage: number;
  status: "proposed" | "approved" | "ongoing" | "completed" | "suspended" | "cancelled";
  featured: boolean;
  updates: ProjectUpdate[];
}

export interface Ward {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  description: string | null;
  status: "active" | "inactive";
  communities_count?: number;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  ward: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "active" | "inactive";
}

export interface Facility {
  id: string;
  name: string;
  type: "government_office" | "school" | "health_facility" | "market" | "community_facility" | "other";
  department: string | null;
  ward: string | null;
  community: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: "active" | "inactive";
}

export interface CivicEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  organizer: string | null;
  registration_url: string | null;
  featured_image_url?: string | null;
  status: "draft" | "published" | "cancelled" | "completed";
  published_at: string | null;
}
