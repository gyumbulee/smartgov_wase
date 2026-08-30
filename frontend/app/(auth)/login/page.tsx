"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      window.localStorage.setItem("smartgov_token", result.token);
      const isCitizen = result.roles.includes("citizen");
      router.push(isCitizen ? "/dashboard" : "/admin/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <LogIn className="h-8 w-8 text-brand-green" />
        <h1 className="mt-3 text-xl font-semibold text-ink">Log in</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Access your citizen dashboard or administration portal.
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Log in
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-brand-green hover:underline">
            Forgot password?
          </Link>
          <Link href="/register" className="text-ink-muted hover:text-brand-green">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
