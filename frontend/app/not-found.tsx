import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-bg px-4 text-center">
      <p className="text-sm font-medium text-brand-green">404</p>
      <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link href="/" className="btn-primary mt-4">
        Back to home
      </Link>
    </div>
  );
}
