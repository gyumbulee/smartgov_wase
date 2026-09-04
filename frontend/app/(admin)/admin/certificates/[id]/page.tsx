"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Plus,
  Trash2,
  Pencil,
  QrCode,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { adminCertificateTemplateService } from "@/services/certificateService";
import type { CertificateTemplate, CertificateTemplateField, CertificateTemplateVersion } from "@/types/certificate";

// Field mapping positions are in millimeters, matching TCPDF's default
// unit — see the backend's CertificateGenerationService. There's no
// visual designer yet; positions are entered numerically against a
// known page size (A4 = 210 x 297mm).
export default function AdminCertificateTemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  function refresh() {
    adminCertificateTemplateService.get(params.id).then(setTemplate);
  }

  useEffect(refresh, [params.id]);

  async function handleActivate(versionId: string) {
    if (!template) return;
    await adminCertificateTemplateService.activateVersion(template.id, versionId);
    refresh();
  }

  if (!template) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  return (
    <div>
      <Link href="/admin/certificates" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to templates
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{template.name}</h1>
          <p className="text-sm text-ink-muted">
            {template.code} {template.service_name && `· ${template.service_name}`}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            template.status === "active"
              ? "bg-brand-light-green text-brand-deep-green"
              : "bg-surface-bg text-ink-muted"
          }`}
        >
          {template.status}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Versions</h2>
        <button onClick={() => setShowUpload(true)} className="btn-secondary">
          <Upload className="mr-2 h-4 w-4" />
          Upload new version
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {template.versions.map((version) => (
          <div key={version.id} className="card">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedVersion(expandedVersion === version.id ? null : version.id)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                {expandedVersion === version.id ? (
                  <ChevronUp className="h-4 w-4 text-ink-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-ink-muted" />
                )}
                <div>
                  <p className="text-sm font-medium text-ink">
                    {version.version}
                    {!version.has_file && <span className="ml-2 text-xs text-amber-600">No file uploaded</span>}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {version.fields.length} field{version.fields.length === 1 ? "" : "s"} mapped
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    version.status === "active"
                      ? "bg-brand-light-green text-brand-deep-green"
                      : version.status === "archived"
                      ? "bg-surface-bg text-ink-muted"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {version.status}
                </span>
                {version.status === "draft" && version.has_file && (
                  <button
                    onClick={() => handleActivate(version.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-green hover:underline"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                  </button>
                )}
              </div>
            </div>

            {expandedVersion === version.id && (
              <div className="mt-4 border-t border-black/5 pt-4">
                <FieldMappingBuilder version={version} onChange={refresh} />
              </div>
            )}
          </div>
        ))}

        {template.versions.length === 0 && (
          <p className="rounded-card border border-dashed border-black/10 py-8 text-center text-sm text-ink-muted">
            No versions yet. Upload the official PDF to get started.
          </p>
        )}
      </div>

      {showUpload && (
        <UploadVersionModal
          templateId={template.id}
          onClose={() => setShowUpload(false)}
          onUploaded={refresh}
        />
      )}
    </div>
  );
}

function UploadVersionModal({
  templateId,
  onClose,
  onUploaded,
}: {
  templateId: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await adminCertificateTemplateService.uploadVersion(templateId, file, version || undefined);
      onUploaded();
      onClose();
    } catch {
      setError("Upload failed. Make sure the file is a PDF under 10MB.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Upload template version</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">Official PDF file</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Version label (optional, e.g. v2)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={uploading || !file} className="btn-primary w-full">
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <p className="text-xs text-ink-muted">
            New versions start as drafts — map fields, then activate when ready.
          </p>
        </form>
      </div>
    </div>
  );
}

function FieldMappingBuilder({
  version,
  onChange,
}: {
  version: CertificateTemplateVersion;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<CertificateTemplateField | "new" | null>(null);

  async function handleDelete(field: CertificateTemplateField) {
    if (!confirm(`Remove field mapping "${field.field_key}"?`)) return;
    await adminCertificateTemplateService.deleteField(version.id, field.id);
    onChange();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">
          Positions are in millimeters from the top-left of the page (A4 = 210 × 297mm).
        </p>
        <button onClick={() => setEditing("new")} className="btn-secondary">
          <Plus className="mr-2 h-4 w-4" />
          Map field
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {version.fields.map((field) => (
          <div key={field.id} className="flex items-center gap-3 rounded-md border border-black/5 px-3 py-2">
            {field.field_key === "qr_code" ? (
              <QrCode className="h-4 w-4 shrink-0 text-brand-green" />
            ) : (
              <span className="h-4 w-4 shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{field.field_key}</p>
              <p className="text-xs text-ink-muted">
                {field.field_key === "qr_code" ? "Verification QR code" : field.data_source} · x:{field.x_position} y:{field.y_position}
              </p>
            </div>
            <button onClick={() => setEditing(field)} className="text-ink-muted hover:text-brand-green">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => handleDelete(field)} className="text-ink-muted hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {version.fields.length === 0 && (
          <p className="rounded-md border border-dashed border-black/10 py-6 text-center text-xs text-ink-muted">
            No fields mapped yet.
          </p>
        )}
      </div>

      {editing && (
        <FieldModal
          versionId={version.id}
          field={editing === "new" ? null : editing}
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

const DATA_SOURCE_OPTIONS = [
  { value: "citizen.full_name", label: "Citizen — full name" },
  { value: "citizen.date_of_birth", label: "Citizen — date of birth" },
  { value: "citizen.gender", label: "Citizen — gender" },
  { value: "citizen.ward", label: "Citizen — ward" },
  { value: "citizen.community", label: "Citizen — community" },
  { value: "application.reference", label: "Application — reference" },
  { value: "application.submitted_date", label: "Application — submitted date" },
  { value: "certificate.number", label: "Certificate — number" },
  { value: "certificate.issue_date", label: "Certificate — issue date" },
  { value: "certificate.verification_code", label: "Certificate — verification code" },
  { value: "service.name", label: "Service — name" },
];

function FieldModal({
  versionId,
  field,
  onClose,
  onSaved,
}: {
  versionId: string;
  field: CertificateTemplateField | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [isQr, setIsQr] = useState(field?.field_key === "qr_code");
  const [fieldKey, setFieldKey] = useState(field?.field_key ?? "");
  const [dataSource, setDataSource] = useState(field?.data_source ?? DATA_SOURCE_OPTIONS[0].value);
  const [customSource, setCustomSource] = useState(
    field?.data_source && field.data_source.startsWith("application.field:") ? field.data_source : ""
  );
  const [useCustomSource, setUseCustomSource] = useState(customSource !== "");
  const [x, setX] = useState(String(field?.x_position ?? 20));
  const [y, setY] = useState(String(field?.y_position ?? 20));
  const [width, setWidth] = useState(String(field?.width ?? 100));
  const [height, setHeight] = useState(String(field?.height ?? 8));
  const [fontSize, setFontSize] = useState(String(field?.font_size ?? 12));
  const [fontStyle, setFontStyle] = useState(field?.font_style ?? "normal");
  const [alignment, setAlignment] = useState(field?.alignment ?? "left");
  const [color, setColor] = useState(field?.color ?? "#17201B");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = isQr
        ? {
            field_key: "qr_code",
            data_source: null,
            x_position: Number(x),
            y_position: Number(y),
            width: Number(width) || 25,
            height: Number(height) || 25,
          }
        : {
            field_key: fieldKey,
            data_source: useCustomSource ? customSource : dataSource,
            x_position: Number(x),
            y_position: Number(y),
            width: Number(width),
            height: Number(height),
            font_family: "helvetica",
            font_size: Number(fontSize),
            font_style: fontStyle,
            alignment,
            color,
          };

      if (field) {
        await adminCertificateTemplateService.updateField(versionId, field.id, payload);
      } else {
        await adminCertificateTemplateService.createField(versionId, payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this field mapping.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{field ? "Edit field mapping" : "Map a field"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!field && (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={isQr} onChange={(e) => setIsQr(e.target.checked)} />
              This is the verification QR code (not a text field)
            </label>
          )}

          {!isQr && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Field key</label>
                <input
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                  placeholder="e.g. full_name"
                  required
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Data source</label>
                {!useCustomSource ? (
                  <select
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value)}
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
                  >
                    {DATA_SOURCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={customSource}
                    onChange={(e) => setCustomSource(e.target.value)}
                    placeholder="application.field:child_full_name"
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setUseCustomSource(!useCustomSource)}
                  className="mt-1 text-xs text-brand-green hover:underline"
                >
                  {useCustomSource ? "Choose from list instead" : "Use a service application field instead"}
                </button>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <NumField label="X position (mm)" value={x} onChange={setX} />
            <NumField label="Y position (mm)" value={y} onChange={setY} />
            <NumField label="Width (mm)" value={width} onChange={setWidth} />
            <NumField label="Height (mm)" value={height} onChange={setHeight} />
          </div>

          {!isQr && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <NumField label="Font size" value={fontSize} onChange={setFontSize} />
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-muted">Style</label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                    className="w-full rounded-md border border-black/10 px-2 py-2 text-sm outline-none focus:border-brand-green"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-muted">Align</label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                    className="w-full rounded-md border border-black/10 px-2 py-2 text-sm outline-none focus:border-brand-green"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Text color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-full rounded-md border border-black/10"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save field mapping"}
          </button>
        </form>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
      />
    </div>
  );
}
