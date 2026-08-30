"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError("We couldn't send a reset link. Please check the email address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-brand-green" />
            <h1 className="mt-3 text-xl font-semibold text-ink">Check your email</h1>
            <p className="mt-1 text-sm text-ink-muted">
              If an account exists for {email}, a password reset link is on its way.
            </p>
          </div>
        ) : (
          <>
            <KeyRound className="h-8 w-8 text-brand-green" />
            <h1 className="mt-3 text-xl font-semibold text-ink">Reset your password</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Enter your account email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send reset link
              </button>
            </form>
          </>
        )}
        <p className="mt-4 text-center text-sm text-ink-muted">
          <Link href="/login" className="text-brand-green hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
