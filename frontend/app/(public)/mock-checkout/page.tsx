import { Suspense } from "react";
import MockCheckoutClient from "./MockCheckoutClient";

export default function MockCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-bg px-4">
          <div className="w-full max-w-sm rounded-card border border-black/5 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-ink-muted">Loading checkout…</p>
          </div>
        </div>
      }
    >
      <MockCheckoutClient />
    </Suspense>
  );
}