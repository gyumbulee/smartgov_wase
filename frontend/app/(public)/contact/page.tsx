"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { publicCivicService } from "@/services/civicService";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await publicCivicService.submitContactMessage({ name, email, phone: phone || undefined, subject, message });
      setSent(true);
    } catch {
      setError("Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <Mail className="mx-auto h-10 w-10 text-brand-green" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">Contact us</h1>
        <p className="mt-2 text-sm text-ink-muted">Get in touch with Wase Local Government.</p>
      </div>

      {sent ? (
        <div className="mt-8 flex flex-col items-center rounded-card border border-brand-green/30 bg-brand-light-green p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-brand-green" />
          <p className="mt-3 text-sm font-medium text-brand-deep-green">Message sent</p>
          <p className="mt-1 text-sm text-brand-deep-green/80">We'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
            className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message"
            required
            rows={5}
            className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </section>
  );
}
