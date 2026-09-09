Fix: "My dashboard" link sent citizens to the admin dashboard
==================================================================

This corrects a bug in the previous fix (the one that made the
public header show "My dashboard" instead of always showing "Log
in/Get started").

Cause: that fix stored roles in localStorage (smartgov_roles) at
login/register, then read that cached value to decide whether to
link to /dashboard (citizen) or /admin/dashboard (staff). Problem:
for ANY session created before that change shipped, smartgov_roles
was never set. JSON.parse("[]") on a missing key succeeds silently
(returns an empty array — it's not a parse error, so it didn't hit
the catch/fallback path either), and [].includes("citizen") is
false — so it fell straight into the "not a citizen" branch and
linked to /admin/dashboard for actual citizens too.

Fix: stopped trusting a cached value entirely. The header now asks
GET /auth/me for the current, authoritative roles at the moment it
needs them, instead of relying on anything written at login time.
This also means it can't go stale the same way again if the login
response shape or storage ever changes later.

Files changed:
  frontend/services/authService.ts
      Added a me() function calling GET /auth/me.

  frontend/app/(public)/layout.tsx
      Dashboard-link detection now calls authService.me() instead of
      reading smartgov_roles from localStorage. Also: if the call
      fails (expired/invalid token), it now clears the token and
      falls back to the logged-out header, instead of showing a
      dashboard link that would just 401.

  frontend/app/(auth)/login/page.tsx
  frontend/app/(auth)/register/page.tsx
      Removed the smartgov_roles localStorage write added by the
      previous fix — it's no longer read anywhere, so keeping it
      would just be unused, confusing dead code.

Note: the smartgov_roles cleanup in the citizen/admin layout logout
handlers (from the previous fix) is left as-is — harmless, and safe
to keep in case a stale key exists from testing the earlier version.

Apply:
  1. Overwrite these 4 files in your repo with the versions in this
     zip.
  2. No .env/config changes, no cache to clear.
  3. Test: log in as a citizen (ideally with an account that was
     already logged in before applying the previous fix, to actually
     exercise the bug), then click a public nav link (e.g.
     Government) — "My dashboard" should now correctly go to
     /dashboard, not /admin/dashboard. Repeat logged in as staff —
     should go to /admin/dashboard.

  git add -A
  git commit -m "Fix: public header dashboard link fetches roles from /auth/me instead of a stale localStorage cache"
  git push
