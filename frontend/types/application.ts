export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "payment_pending"
  | "paid"
  | "processing"
  | "completed"
  | "correction_required"
  | "failed"
  | "cancelled";

export interface ApplicationDocument {
  id: string;
  requirement_id: string;
  document_type: string | null;
  original_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  status: "uploaded" | "accepted" | "rejected" | "expired";
}

export interface ApplicationStatusHistoryEntry {
  from_status: string | null;
  to_status: string;
  reason: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  application_reference: string;
  status: ApplicationStatus;
  current_step: string | null;
  service: { id: string; name: string; slug: string } | null;
  fee: number | null;
  currency: string | null;
  requires_payment: boolean | null;
  field_values: Record<string, string | null>;
  documents: ApplicationDocument[];
  status_history: ApplicationStatusHistoryEntry[];
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
}
