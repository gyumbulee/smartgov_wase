import { api } from "@/lib/api";
import type { Payment } from "@/types/payment";

export const paymentService = {
  // Redirects the browser to the gateway's (or stub's) checkout page.
  // The backend never trusts what happens after this on its own —
  // it re-verifies server-side when the browser comes back.
  initialize: async (applicationId: string) => {
    const { data } = await api.post<{ checkout_url: string; payment_reference: string }>(
      `/citizen/applications/${applicationId}/payments/initialize`
    );
    return data;
  },

  current: async (applicationId: string) => {
    const { data } = await api.get<{ data: Payment } | null>(
      `/citizen/applications/${applicationId}/payments/current`
    );
    return data?.data ?? null;
  },

  history: async () => {
    const { data } = await api.get<{ data: Payment[] }>("/citizen/payments");
    return data.data;
  },

  // Dev-only: records the simulated outcome for the stub gateway.
  // A no-op / 404 against any real gateway config — see PaymentStubController.
  simulateStub: async (paymentReference: string, outcome: "success" | "failed") => {
    await api.post("/public/payments/stub/simulate", {
      payment_reference: paymentReference,
      outcome,
    });
  },
};
