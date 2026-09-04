"use client";

import { useEffect, useState } from "react";
import { Award, Download, ShieldCheck } from "lucide-react";
import { certificateService } from "@/services/certificateService";
import type { Certificate } from "@/types/certificate";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    certificateService.list().then(setCertificates);
  }, []);

  async function handleDownload(cert: Certificate) {
    setDownloadingId(cert.id);
    try {
      await certificateService.download(cert.id, `${cert.certificate_number}.pdf`);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">My certificates</h1>
      <p className="mt-1 text-sm text-ink-muted">Certificates issued to you, ready to view or download.</p>

      <div className="mt-6 space-y-3">
        {certificates?.map((cert) => (
          <div key={cert.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{cert.service?.name ?? cert.certificate_type}</p>
                <p className="text-xs text-ink-muted">{cert.certificate_number}</p>
                {cert.issue_date && (
                  <p className="text-xs text-ink-muted">Issued {new Date(cert.issue_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
                {cert.verification_code}
              </span>
              <button
                onClick={() => handleDownload(cert)}
                disabled={downloadingId === cert.id}
                className="btn-secondary"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloadingId === cert.id ? "Downloading…" : "Download"}
              </button>
            </div>
          </div>
        ))}

        {certificates?.length === 0 && (
          <div className="flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
            <Award className="h-8 w-8 text-ink-muted" />
            <p className="mt-3 text-sm font-medium text-ink">No certificates yet</p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Certificates from completed applications will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
