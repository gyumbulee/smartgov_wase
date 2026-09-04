"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { paymentService } from "@/services/paymentService";

/**
 * Development-only simulated checkout.
 *
 * This page stands in for Flutterwave's hosted checkout page when
 * PAYMENT_GATEWAY=stub.
 *
 * The simulated choice is sent to the backend, which records the
 * result and redirects back through the same payment callback flow
 * used by the real gateway.
 */
export default function MockCheckoutClient() {
  const params = useSearchParams();

  const ref = params.get("ref") ?? "";
  const amount = params.get("amount") ?? "0";
  const currency = params.get("currency") ?? "NGN";
  const redirect = params.get("redirect") ?? "";

  const [loading, setLoading] = useState<"pay" | "fail" | null>(null);

  async function handleChoice(outcome: "success" | "failed") {
    if (!ref) {
      return;
    }

    setLoading(outcome === "success" ? "pay" : "fail");

    try {
      await paymentService.simulateStub(ref, outcome);
    } finally {
      const url = new URL(
        redirect || window.location.origin,
        window.location.origin
      );

      url.searchParams.set("tx_ref", ref);

      window.location.href = url.toString();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-bg px-4">
      <div className="w-full max-w-sm rounded-card border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          <ShieldAlert className="h-4 w-4 shrink-0" />

          <span>
            Development-only simulated checkout — no real payment gateway is
            involved.
          </span>
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs text-ink-muted">Amount due</p>

          <p className="text-2xl font-semibold text-ink">
            {currency} {Number(amount).toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-ink-muted">
            Ref: {ref || "No payment reference"}
          </p>
        </div>

        {!ref ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Missing payment reference. Please return to the application and
            start the payment process again.
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            <button
              onClick={() => handleChoice("success")}
              disabled={loading !== null}
              className="btn-primary w-full"
            >
              {loading === "pay" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}

              Simulate successful payment
            </button>

            <button
              onClick={() => handleChoice("failed")}
              disabled={loading !== null}
              className="flex w-full items-center justify-center rounded-md border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "fail" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}

              Simulate failed payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}