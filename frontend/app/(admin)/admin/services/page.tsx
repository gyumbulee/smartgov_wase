"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Banknote, CheckCircle2, PauseCircle, X, Settings2 } from "lucide-react";
import { serviceService } from "@/services/serviceService";
import type { Service } from "@/types/service";

// Admin services dashboard (spec §26/§27). Fee-setting is deliberately
// available to any admin with 'services.manage' from right here — per
// business decision, fees are configured centrally on this dashboard
// for every service rather than through a separate finance workflow.
export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [feeEditId, setFeeEditId] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState("");

  function refresh() {
    serviceService.adminList().then((res) => setServices(res.data));
  }

  useEffect(refresh, []);

  async function handlePublish(id: string) {
    await serviceService.adminPublish(id);
    refresh();
  }

  async function handleSuspend(id: string) {
    await serviceService.adminSuspend(id);
    refresh();
  }

  async function handleSetFee(id: string) {
    const amount = parseFloat(feeInput);
    if (Number.isNaN(amount) || amount < 0) return;
    await serviceService.adminSetFee(id, amount);
    setFeeEditId(null);
    setFeeInput("");
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Services</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Configure services, publication status, and fees.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New service
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services?.map((service) => (
              <tr key={service.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/services/${service.id}`} className="font-medium text-ink hover:text-brand-green">
                    {service.name}
                  </Link>
                  <p className="text-xs text-ink-muted">{service.service_code}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={service.status} />
                </td>
                <td className="px-4 py-3">
                  {feeEditId === service.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={feeInput}
                        onChange={(e) => setFeeInput(e.target.value.replace(/[^\d.]/g, ""))}
                        placeholder="Amount"
                        className="w-24 rounded-md border border-black/10 px-2 py-1 text-sm outline-none focus:border-brand-green"
                      />
                      <button
                        onClick={() => handleSetFee(service.id)}
                        className="text-xs font-medium text-brand-green hover:underline"
                      >
                        Save
                      </button>
                      <button onClick={() => setFeeEditId(null)} className="text-ink-muted">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setFeeEditId(service.id);
                        setFeeInput(String(service.fee));
                      }}
                      className="flex items-center gap-1 text-ink hover:text-brand-green"
                    >
                      <Banknote className="h-3.5 w-3.5" />
                      ₦{service.fee.toLocaleString()}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/services/${service.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-brand-green"
                    >
                      <Settings2 className="h-3.5 w-3.5" /> Manage
                    </Link>
                    {service.status !== "active" ? (
                      <button
                        onClick={() => handlePublish(service.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-green hover:underline"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(service.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-red-600"
                      >
                        <PauseCircle className="h-3.5 w-3.5" /> Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {services?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No services yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateServiceModal onClose={() => setShowCreate(false)} onCreated={refresh} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-surface-bg text-ink-muted",
    active: "bg-brand-light-green text-brand-deep-green",
    suspended: "bg-amber-50 text-amber-700",
    retired: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}

function CreateServiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [fee, setFee] = useState("0");
  const [processingMinutes, setProcessingMinutes] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await serviceService.adminCreate({
        name,
        service_code: serviceCode,
        fee: parseFloat(fee) || 0,
        estimated_processing_minutes: parseInt(processingMinutes, 10) || null,
        requires_identity_verification: true,
        requires_payment: parseFloat(fee) > 0,
      });
      onCreated();
      onClose();
    } catch (err) {
      // Surface the backend's actual validation message instead of
      // guessing "check the service code" for every possible failure
      // (a wrong guess here previously masked at least one report of
      // the service actually being created despite an error being
      // shown — likely some other failure after the insert, e.g. in
      // audit logging — which this message would have revealed).
      const message =
        (axios.isAxiosError(err) &&
          (err.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(" ")
            : err.response?.data?.message)) ||
        "Couldn't create the service. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">New service</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Service name"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={serviceCode}
            onChange={(e) => setServiceCode(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
            placeholder="SERVICE_CODE"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <div className="flex gap-3">
            <input
              value={fee}
              onChange={(e) => setFee(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="Fee (NGN)"
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
            <input
              value={processingMinutes}
              onChange={(e) => setProcessingMinutes(e.target.value.replace(/\D/g, ""))}
              placeholder="Processing (min)"
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Creating…" : "Create as draft"}
          </button>
          <p className="text-xs text-ink-muted">
            New services start as drafts — publish them from the list once configured.
          </p>
        </form>
      </div>
    </div>
  );
}
