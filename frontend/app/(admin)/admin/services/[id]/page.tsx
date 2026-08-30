"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  GripVertical,
  FileText,
  ListChecks,
} from "lucide-react";
import { serviceService } from "@/services/serviceService";
import type { Service, ServiceField, ServiceRequirement } from "@/types/service";

const FIELD_TYPES = [
  "text", "textarea", "date", "select", "radio",
  "checkbox", "number", "email", "phone", "file", "address",
] as const;

// Lets administrators configure a service's dynamic application form
// and document requirements without a developer touching code for
// every new certificate type (spec §16).
export default function AdminServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [tab, setTab] = useState<"fields" | "requirements">("fields");

  function refresh() {
    serviceService.adminGet(params.id).then(setService);
  }

  useEffect(refresh, [params.id]);

  if (!service) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  return (
    <div>
      <Link href="/admin/services" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to services
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{service.name}</h1>
          <p className="text-sm text-ink-muted">{service.service_code} · ₦{service.fee.toLocaleString()}</p>
        </div>
        <span className="rounded-full bg-brand-light-green px-3 py-1 text-xs font-medium text-brand-deep-green">
          {service.status}
        </span>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-black/5">
        <TabButton active={tab === "fields"} onClick={() => setTab("fields")} icon={FileText}>
          Application fields ({service.fields.length})
        </TabButton>
        <TabButton active={tab === "requirements"} onClick={() => setTab("requirements")} icon={ListChecks}>
          Requirements ({service.requirements.length})
        </TabButton>
      </div>

      <div className="mt-6">
        {tab === "fields" ? (
          <FieldsBuilder serviceId={service.id} fields={service.fields} onChange={refresh} />
        ) : (
          <RequirementsBuilder serviceId={service.id} requirements={service.requirements} onChange={refresh} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors " +
        (active
          ? "border-brand-green text-brand-green"
          : "border-transparent text-ink-muted hover:text-ink")
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------
// Fields builder
// ---------------------------------------------------------------------

function FieldsBuilder({
  serviceId,
  fields,
  onChange,
}: {
  serviceId: string;
  fields: ServiceField[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<ServiceField | "new" | null>(null);

  async function handleDelete(field: ServiceField) {
    if (!confirm(`Remove field "${field.label}"? This cannot be undone.`)) return;
    await serviceService.adminDeleteField(serviceId, field.id);
    onChange();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          These fields build the application form citizens fill out for this service.
        </p>
        <button onClick={() => setEditing("new")} className="btn-secondary">
          <Plus className="mr-2 h-4 w-4" />
          Add field
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {fields
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((field) => (
            <div key={field.id} className="card flex items-center gap-3 py-3">
              <GripVertical className="h-4 w-4 shrink-0 text-ink-muted/50" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">
                  {field.label}
                  {field.is_required && <span className="ml-1 text-red-500">*</span>}
                </p>
                <p className="text-xs text-ink-muted">
                  {field.field_key} · {field.field_type}
                  {field.is_readonly ? " · readonly" : ""}
                </p>
              </div>
              <button onClick={() => setEditing(field)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(field)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        {fields.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 py-8 text-center text-sm text-ink-muted">
            No fields yet. Add the questions citizens need to answer for this service.
          </p>
        )}
      </div>

      {editing && (
        <FieldModal
          serviceId={serviceId}
          field={editing === "new" ? null : editing}
          nextSortOrder={fields.length + 1}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function FieldModal({
  serviceId,
  field,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  serviceId: string;
  field: ServiceField | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(field?.label ?? "");
  const [fieldKey, setFieldKey] = useState(field?.field_key ?? "");
  const [fieldType, setFieldType] = useState(field?.field_type ?? "text");
  const [isRequired, setIsRequired] = useState(field?.is_required ?? true);
  const [helpText, setHelpText] = useState(field?.help_text ?? "");
  const [optionsText, setOptionsText] = useState((field?.options ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsOptions = ["select", "radio", "checkbox"].includes(fieldType);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        label,
        field_key: fieldKey || label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_"),
        field_type: fieldType,
        is_required: isRequired,
        help_text: helpText || null,
        options: needsOptions
          ? optionsText.split(",").map((o) => o.trim()).filter(Boolean)
          : null,
        sort_order: field?.sort_order ?? nextSortOrder,
      };

      if (field) {
        await serviceService.adminUpdateField(serviceId, field.id, payload);
      } else {
        await serviceService.adminCreateField(serviceId, payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this field. Check the field key is unique for this service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={field ? "Edit field" : "Add field"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormInput label="Label" value={label} onChange={setLabel} placeholder="e.g. Child's full name" required />
        <FormInput
          label="Field key"
          value={fieldKey}
          onChange={(v) => setFieldKey(v.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
          placeholder="auto-generated from label if left blank"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Field type</label>
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {needsOptions && (
          <FormInput
            label="Options (comma-separated)"
            value={optionsText}
            onChange={setOptionsText}
            placeholder="e.g. Male, Female"
          />
        )}
        <FormInput label="Help text (optional)" value={helpText} onChange={setHelpText} />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />
          Required field
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Saving…" : "Save field"}
        </button>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------
// Requirements builder
// ---------------------------------------------------------------------

function RequirementsBuilder({
  serviceId,
  requirements,
  onChange,
}: {
  serviceId: string;
  requirements: ServiceRequirement[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<ServiceRequirement | "new" | null>(null);

  async function handleDelete(req: ServiceRequirement) {
    if (!confirm(`Remove requirement "${req.name}"?`)) return;
    await serviceService.adminDeleteRequirement(serviceId, req.id);
    onChange();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          Documents citizens must upload when applying for this service.
        </p>
        <button onClick={() => setEditing("new")} className="btn-secondary">
          <Plus className="mr-2 h-4 w-4" />
          Add requirement
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {requirements
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((req) => (
            <div key={req.id} className="card flex items-center gap-3 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">
                  {req.name}
                  {req.is_required && <span className="ml-1 text-red-500">*</span>}
                </p>
                {req.accepted_file_types && (
                  <p className="text-xs text-ink-muted">Accepts: {req.accepted_file_types}</p>
                )}
              </div>
              <button onClick={() => setEditing(req)} className="text-ink-muted hover:text-brand-green">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(req)} className="text-ink-muted hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        {requirements.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 py-8 text-center text-sm text-ink-muted">
            No requirements yet. Add the documents citizens need to provide.
          </p>
        )}
      </div>

      {editing && (
        <RequirementModal
          serviceId={serviceId}
          requirement={editing === "new" ? null : editing}
          nextSortOrder={requirements.length + 1}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function RequirementModal({
  serviceId,
  requirement,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  serviceId: string;
  requirement: ServiceRequirement | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(requirement?.name ?? "");
  const [description, setDescription] = useState(requirement?.description ?? "");
  const [isRequired, setIsRequired] = useState(requirement?.is_required ?? true);
  const [acceptedTypes, setAcceptedTypes] = useState(requirement?.accepted_file_types ?? "pdf,jpg,png");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        description: description || null,
        is_required: isRequired,
        accepted_file_types: acceptedTypes || null,
        requirement_type: "document",
        sort_order: requirement?.sort_order ?? nextSortOrder,
      };

      if (requirement) {
        await serviceService.adminUpdateRequirement(serviceId, requirement.id, payload);
      } else {
        await serviceService.adminCreateRequirement(serviceId, payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this requirement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={requirement ? "Edit requirement" : "Add requirement"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormInput label="Name" value={name} onChange={setName} placeholder="e.g. Parent/guardian ID" required />
        <FormInput label="Description (optional)" value={description} onChange={setDescription} />
        <FormInput
          label="Accepted file types (comma-separated)"
          value={acceptedTypes}
          onChange={setAcceptedTypes}
          placeholder="pdf,jpg,png"
        />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />
          Required document
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Saving…" : "Save requirement"}
        </button>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------
// Shared small pieces
// ---------------------------------------------------------------------

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
      />
    </div>
  );
}
