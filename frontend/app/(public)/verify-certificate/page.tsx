"use client";

import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";

// Public certificate verification (spec §21). Only minimum necessary
// information is ever displayed — no NIN, no citizen personal data
// beyond what the official certificate itself would show.
export default function VerifyCertificatePage() {
  const [code, setCode] = useState("");

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
          // Wired to /api/v1/public/certificates/verify in Phase 6.
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. WLG/BC/2026/000184"
          className="flex-1 rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
        />
        <button type="submit" className="btn-primary">
          <Search className="mr-2 h-4 w-4" />
          Verify
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-muted">
        Certificate verification will be available once the certificate
        generation system (Phase 6) is live.
      </p>
    </section>
  );
}
