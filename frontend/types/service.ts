export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  status: string;
  services_count?: number;
}

export interface ServiceField {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  placeholder: string | null;
  help_text: string | null;
  default_value: string | null;
  options: string[] | null;
  is_required: boolean;
  is_readonly: boolean;
  sort_order: number;
}

export interface ServiceRequirement {
  id: string;
  name: string;
  description: string | null;
  requirement_type: string;
  is_required: boolean;
  accepted_file_types: string | null;
  max_file_size: number | null;
  sort_order: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  service_code: string;
  short_description: string | null;
  description: string | null;
  category: ServiceCategory | null;
  department: { id: string; name: string } | null;
  eligibility_description: string | null;
  fee: number;
  currency: string;
  estimated_processing_minutes: number | null;
  status: "draft" | "active" | "suspended" | "retired";
  is_online: boolean;
  requires_identity_verification: boolean;
  requires_eligibility_verification: boolean;
  requires_payment: boolean;
  fields: ServiceField[];
  requirements: ServiceRequirement[];
  published_at: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface ServiceFeeVersion {
  id: string;
  service_id: string;
  amount: string;
  currency: string;
  effective_from: string;
  effective_until: string | null;
  status: "scheduled" | "active" | "expired";
}
