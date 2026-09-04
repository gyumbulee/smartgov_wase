"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileStack, X, CheckCircle2 } from "lucide-react";
import { adminCertificateTemplateService } from "@/services/certificateService";
import { serviceService } from "@/services/serviceService";
import type { CertificateTemplate } from "@/types/certificate";
import type { Service } from "@/types/service";

// Admin certificate template management (spec §17-18). A template only
// becomes eligible for automated generation once it has an active
// version with an uploaded PDF and mapped fields — see the detail page.
export default function AdminCertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function refresh() {
    adminCertificateTemplateService.list().then(setTemplates);
  }

  useEffect(refresh, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Certificate templates</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Upload the government's official PDF templates and map fields onto them.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New template
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <Link
            key={template.id}
            href={`/admin/certificates/${template.id}`}
            className="card flex flex-col gap-3 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <FileStack className="h-5 w-5" />
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  template.status === "active"
                    ? "bg-brand-light-green text-brand-deep-green"
                    : "bg-surface-bg text-ink-muted"
                }`}
              >
                {template.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{template.name}</p>
              <p className="text-xs text-ink-muted">{template.code}</p>
              {template.service_name && (
                <p className="mt-1 text-xs text-ink-muted">Service: {template.service_name}</p>
              )}
            </div>
            <p className="text-xs text-ink-muted">
              {template.versions?.length ?? 0} version{template.versions?.length === 1 ? "" : "s"}
            </p>
          </Link>
        ))}

        {templates?.length === 0 && (
          <div className="col-span-full flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
            <FileStack className="h-8 w-8 text-ink-muted" />
            <p className="mt-3 text-sm font-medium text-ink">No templates yet</p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Create a template, upload the official PDF, and map fields to start generating certificates.
            </p>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTemplateModal onClose={() => setShowCreate(false)} onCreated={refresh} />
      )}
    </div>
  );
}

function CreateTemplateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    serviceService.adminList().then((res) => setServices(res.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminCertificateTemplateService.create({
        name,
        code: code.toUpperCase().replace(/\s+/g, "_"),
        service_id: serviceId,
        document_type: code.toUpperCase().replace(/\s+/g, "_"),
      });
      onCreated();
      onClose();
    } catch {
      setError("Couldn't create template. Check the code is unique.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">New certificate template</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="TEMPLATE_CODE"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Creating…" : "Create template"}
          </button>
          <p className="flex items-start gap-1.5 text-xs text-ink-muted">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            You'll upload the official PDF and map fields on the next screen.
          </p>
        </form>
      </div>
    </div>
  );
}
