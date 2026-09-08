export interface ComplaintCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  department: string | null;
}

export interface ComplaintUpdateEntry {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_reference: string;
  title: string;
  description: string;
  category: ComplaintCategory | null;
  department: string | null;
  citizen?: { full_name: string; citizen_reference: string } | null;
  location: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  status: "submitted" | "received" | "assigned" | "in_progress" | "resolved" | "closed" | "rejected";
  assigned_to: string | null;
  updates: ComplaintUpdateEntry[];
  submitted_at: string | null;
  resolved_at: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "in_progress" | "resolved" | "spam";
  assigned_to: string | null;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  service_id: string | null;
  sort_order: number;
  status: "active" | "inactive";
}

export interface CivicDocument {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  version: string | null;
  file_url: string | null;
  file_size: number | null;
  is_public: boolean;
  published_at: string | null;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}
