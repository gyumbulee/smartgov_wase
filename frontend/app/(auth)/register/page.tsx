"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, CheckCircle2, Loader2, MapPinOff } from "lucide-react";
import { authService } from "@/services/authService";

type Step = "nin" | "account" | "done" | "ineligible";

// Registration flow: NIN -> identity verification -> eligibility gate
// (residence must be Wase, Plateau State — checked server-side
// immediately, before any account can be created) -> account creation.
// The identity data itself is never re-entered by the citizen — it's
// reused from the verification response on the backend.
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("nin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ineligibleMessage, setIneligibleMessage] = useState<string | null>(null);

  const [nin, setNin] = useState("");
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  async function handleNinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authService.verifyNin(nin);

      if (!result.verified) {
        setError(result.message || "We couldn't verify that NIN. Please check and try again.");
        return;
      }

      if (!result.eligible) {
        setIneligibleMessage(result.message);
        setStep("ineligible");
        return;
      }

      if (!result.request_reference) {
        setError("Something went wrong verifying your NIN. Please try again.");
        return;
      }

      setRequestReference(result.request_reference);
      setPreviewName(
        [result.identity_preview?.first_name, result.identity_preview?.last_name]
          .filter(Boolean)
          .join(" ") || null
      );
      setStep("account");
    } catch {
      setError("Something went wrong verifying your NIN. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (!requestReference) {
      setError("Your NIN verification session expired. Please start again.");
      setStep("nin");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.completeCitizenRegistration({
        request_reference: requestReference,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      window.localStorage.setItem("smartgov_token", result.token);
      // This flow only ever registers citizens (see completeCitizenRegistration),
      // so the role is known without needing another round trip.
      window.localStorage.setItem("smartgov_roles", JSON.stringify(["citizen"]));
      setStep("done");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      setError("We couldn't create your account. The email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card">
        {/* Step indicator */}
        {step !== "ineligible" && (
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-ink-muted">
            <StepDot active={step === "nin"} done={step !== "nin"} label="Identity" />
            <span className="h-px flex-1 bg-black/10" />
            <StepDot active={step === "account"} done={step === "done"} label="Account" />
            <span className="h-px flex-1 bg-black/10" />
            <StepDot active={step === "done"} done={false} label="Done" />
          </div>
        )}

        {step === "nin" && (
          <>
            <ShieldCheck className="h-8 w-8 text-brand-green" />
            <h1 className="mt-3 text-xl font-semibold text-ink">Verify your identity</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Enter your National Identification Number (NIN). We use it only
              to confirm your identity — it is never displayed or stored in
              plain text.
            </p>
            <form onSubmit={handleNinSubmit} className="mt-6 space-y-4">
              <input
                inputMode="numeric"
                maxLength={11}
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                placeholder="11-digit NIN"
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading || nin.length !== 11} className="btn-primary w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify identity
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </form>
          </>
        )}

        {step === "account" && (
          <>
            <CheckCircle2 className="h-8 w-8 text-brand-green" />
            <h1 className="mt-3 text-xl font-semibold text-ink">
              {previewName ? `Welcome, ${previewName}` : "Identity verified"}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Create your login. Your verified details will populate your citizen profile automatically.
            </p>
            <form onSubmit={handleAccountSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 8 characters)"
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                required
                minLength={8}
              />
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                required
                minLength={8}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create account
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-brand-green" />
            <h1 className="mt-3 text-xl font-semibold text-ink">Account created</h1>
            <p className="mt-1 text-sm text-ink-muted">Taking you to your dashboard…</p>
          </div>
        )}

        {step === "ineligible" && (
          <div className="text-center">
            <MapPinOff className="mx-auto h-10 w-10 text-ink-muted" />
            <h1 className="mt-3 text-xl font-semibold text-ink">Not available in your area</h1>
            <p className="mt-2 text-sm text-ink-muted">
              {ineligibleMessage ??
                "SmartGov-Wase accounts are only available to residents of Wase, Plateau State."}
            </p>
            <p className="mt-4 text-xs text-ink-muted">
              Your identity was verified, but an account could not be created
              because your registered address is outside Wase LGA.
            </p>
          </div>
        )}
      </div>

      {(step === "nin" || step === "account") && (
        <p className="mt-4 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-green hover:underline">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={
          "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold " +
          (done
            ? "bg-brand-green text-white"
            : active
            ? "border-2 border-brand-green text-brand-green"
            : "border border-black/15 text-ink-muted")
        }
      >
        {done ? "✓" : ""}
      </span>
      <span className={active ? "text-ink" : ""}>{label}</span>
    </span>
  );
}
