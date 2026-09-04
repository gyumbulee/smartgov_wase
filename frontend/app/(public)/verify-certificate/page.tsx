"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { publicCertificateService } from "@/services/certificateService";

// Public certificate verification (spec §21). Only minimum necessary
// information is ever displayed — no NIN, no citizen personal data
// beyond what the official certificate itself would show. QR codes
// embedded on generated certificates link here with ?code=..., so a
// scan verifies automatically without the person typing anything.
function VerifyCertificateForm() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; message?: string; certificate?: Record<string, string> } | null>(null);

  async function handleVerify(value: string) {
    if (!value.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await publicCertificateService.verify(value.trim());
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-brand-green" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">Verify a certificate</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter a certificate number or verification code to confirm its authenticity.
        </p>
      </div>

      <form
        className="mt-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify(code);
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. WLG/BC/2026/000184"
          className="flex-1 rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Verify
        </button>
      </form>

      {result?.verified && result.certificate && (
        <div className="mt-8 rounded-card border border-brand-green/30 bg-brand-light-green p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-deep-green">
            <CheckCircle2 className="h-5 w-5" />
            Certificate verified
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Certificate" value={result.certificate.certificate_type} />
            <Row label="Certificate Number" value={result.certificate.certificate_number} />
            <Row label="Issue Date" value={result.certificate.issue_date} />
            <Row label="Status" value={result.certificate.status} />
          </dl>
          <p className="mt-4 text-xs text-brand-deep-green/70">
            Issuing Authority: Wase Local Government
          </p>
        </div>
      )}

      {result && !result.verified && (
        <div className="mt-8 flex items-center gap-2 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle className="h-5 w-5 shrink-0" />
          {result.message ?? "No matching valid certificate was found."}
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between border-b border-brand-green/10 pb-2">
      <dt className="text-brand-deep-green/70">{label}</dt>
      <dd className="font-medium text-brand-deep-green">{value ?? "—"}</dd>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-ink-muted">Loading…</div>}>
      <VerifyCertificateForm />
    </Suspense>
  );
}
