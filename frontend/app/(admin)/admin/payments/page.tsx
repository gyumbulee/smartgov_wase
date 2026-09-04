"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Payment } from "@/types/payment";
import type { PaginatedResponse } from "@/types/service";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  successful: "bg-brand-light-green text-brand-deep-green",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-surface-bg text-ink-muted",
  refunded: "bg-blue-50 text-blue-700",
};

// Read-only payment oversight (spec §26/§27) — administration monitors,
// it doesn't manually approve payments; confirmation is always
// server-verified via PaymentService, not an admin action.
export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    api.get<PaginatedResponse<Payment>>("/admin/payments").then((res) => setPayments(res.data.data));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Payments</h1>
      <p className="mt-1 text-sm text-ink-muted">All payment transactions across services.</p>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Gateway</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((payment) => (
              <tr key={payment.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{payment.payment_reference}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {payment.application?.service_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-ink">
                  {payment.currency} {payment.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-ink-muted">{payment.gateway}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status] ?? ""}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
