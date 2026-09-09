Fix: no CORS policy defined (Security hardening #2)
======================================================

Cause: config/cors.php never existed. Laravel's HandleCors
middleware (built into the framework core since 9.2, applied
automatically — no manual registration needed) reads its policy
from config('cors'); with no file, there was no explicit,
intentional CORS policy for a production deployment where the
frontend and backend are genuinely different origins.

File added:
  backend/config/cors.php

Scoped to exactly FRONTEND_URL (the same env var already used for
payment/certificate redirects — see config/payment.php from the
earlier fix) rather than a wildcard, since this API should only
ever be called from your one frontend.

supports_credentials is set to false because auth here is a Bearer
token sent via the Authorization header (see frontend lib/api.ts),
not cookies — the browser doesn't need to send/receive cookies
cross-origin for this API, so there's no reason to enable it.

Apply:
  1. Add this file to backend/config/cors.php in your repo.
  2. Make sure FRONTEND_URL is set correctly in your real .env for
     whatever environment you're deploying to (e.g.
     https://smartgov-wase.yourdomain.ng in production) — it
     already defaults to http://localhost:3000 for local dev.
  3. Run `php artisan config:clear` if you've ever cached config.
  4. Test from the actual frontend (not Postman/curl, which don't
     enforce CORS) that requests still succeed, and that a request
     from a different origin is rejected.

  git add -A
  git commit -m "Security: add explicit CORS policy scoped to FRONTEND_URL"
  git push
