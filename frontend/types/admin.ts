export interface Role {
  id: string;
  name: string;
  slug: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: "active" | "inactive";
  sort_order: number;
  staff_count?: number;
}

export interface StaffUser {
  id: string;
  email: string;
  status: string;
  roles: Role[];
  staff: {
    first_name: string;
    last_name: string;
    position_title: string | null;
    department: string | null;
    employee_reference: string;
  } | null;
  last_login_at: string | null;
  created_at: string;
}

export interface AdminCitizen {
  id: string;
  citizen_reference: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  ward: string | null;
  community: string | null;
  identity_status: string;
  eligibility_status: string;
  applications_count: number;
  created_at: string;
}

export interface AdminApplication {
  id: string;
  application_reference: string;
  status: string;
  citizen: { id: string; full_name: string; citizen_reference: string } | null;
  service: { id: string; name: string } | null;
  fee: number | null;
  currency?: string | null;
  status_history?: { from_status: string | null; to_status: string; reason: string | null; created_at: string }[];
  documents?: { id: string; original_filename: string | null; status: string }[];
  payments?: { id: string; payment_reference: string; status: string; amount: number; currency: string; paid_at: string | null }[];
  certificate?: { id: string; certificate_number: string; status: string } | null;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ProcessingJob {
  id: string;
  job_type: string;
  status: string;
  attempts: number;
  error_message: string | null;
  application: {
    id: string;
    application_reference: string;
    service_name: string | null;
    status: string;
  } | null;
  started_at: string | null;
  failed_at: string | null;
  completed_at: string | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  auditable_type: string | null;
  auditable_id: string | null;
  user: string | null;
  ip_address: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}
