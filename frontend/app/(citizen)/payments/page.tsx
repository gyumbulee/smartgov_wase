"use client";

import { useEffect, useState } from "react";
import { Banknote, Receipt as ReceiptIcon } from "lucide-react";
import { paymentService } from "@/services/paymentService";
import type { Payment } from "@/types/payment";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  successful: "bg-brand-light-green text-brand-deep-green",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-surface-bg text-ink-muted",
  refunded: "bg-blue-50 text-blue-700",
};

export default function PaymentsHistoryPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    paymentService.history().then(setPayments);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Payments</h1>
      <p className="mt-1 text-sm text-ink-muted">Your payment history and receipts.</p>

      <div className="mt-6 space-y-3">
        {payments?.map((payment) => (
          <div key={payment.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <Banknote className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {payment.application?.service_name ?? "Payment"}
                </p>
                <p className="text-xs text-ink-muted">
                  {payment.currency} {payment.amount.toLocaleString()} · {payment.payment_reference}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {payment.receipt && (
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  <ReceiptIcon className="h-3.5 w-3.5" />
                  {payment.receipt.receipt_number}
                </span>
              )}
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status] ?? ""}`}>
                {payment.status}
              </span>
            </div>
          </div>
        ))}

        {payments?.length === 0 && (
          <div className="flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
            <Banknote className="h-8 w-8 text-ink-muted" />
            <p className="mt-3 text-sm font-medium text-ink">No payments yet</p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Payments you make for government services will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
