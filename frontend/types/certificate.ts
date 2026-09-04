export interface Certificate {
  id: string;
  certificate_number: string;
  certificate_type: string;
  issue_date: string | null;
  status: "generated" | "active" | "revoked" | "expired";
  verification_code: string;
  service: { id: string; name: string } | null;
  application_reference: string | null;
  generated_at: string | null;
}

export interface CertificateTemplateField {
  id: string;
  field_key: string;
  data_source: string | null;
  x_position: number;
  y_position: number;
  width: number | null;
  height: number | null;
  font_family: string | null;
  font_size: number | null;
  font_style: string | null;
  alignment: string | null;
  color: string | null;
}

export interface CertificateTemplateVersion {
  id: string;
  version: string;
  status: "draft" | "active" | "archived";
  has_file: boolean;
  effective_from: string | null;
  effective_until: string | null;
  fields: CertificateTemplateField[];
  created_at: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  code: string;
  description: string | null;
  service_id: string;
  service_name: string | null;
  document_type: string | null;
  status: "active" | "inactive";
  versions: CertificateTemplateVersion[];
}
