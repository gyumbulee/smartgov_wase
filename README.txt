Fix bundle: /government 404 + public pages showing "logged out"
====================================================================

--------------------------------------------------------------------
1) /government 404
--------------------------------------------------------------------

Cause: the top nav (app/(public)/layout.tsx) links to "/government",
but no page ever existed at that path — the only path-related pages
were the individual ones (departments, leadership, wards, facilities,
projects), never a hub page tying them together.

File added:
  frontend/app/(public)/government/page.tsx

Built to match the existing /discover hub page's pattern — links out
to Departments, Leadership, Wards, Public facilities, and Development
projects, all of which already exist and work.

--------------------------------------------------------------------
2) Public pages showing "Login/Register" even when already logged in
--------------------------------------------------------------------

Cause: app/(public)/layout.tsx's header always rendered "Log in" /
"Get started" unconditionally — it never checked whether the person
browsing was actually authenticated. So a logged-in citizen or admin
clicking any public link (Services, Government, Discover, News,
Contact — including the newly-fixed /government) would land on a
page whose header looked exactly like a logged-out visitor's, even
though their token in localStorage was completely untouched. Nothing
was actually clearing the session — the header just never checked it.

Files changed:
  frontend/app/(public)/layout.tsx
      Now checks localStorage on mount; if a token is present, shows
      a "My dashboard" button (linking to /dashboard for citizens or
      /admin/dashboard for staff) instead of Log in/Get started.

  frontend/app/(auth)/login/page.tsx
  frontend/app/(auth)/register/page.tsx
      Both now also store smartgov_roles (JSON array) in localStorage
      alongside smartgov_token, so the public layout can tell citizen
      vs staff apart without an extra API call. (login.tsx already
      had the roles array in hand for its own dashboard redirect —
      this just also persists it. register.tsx only ever registers
      citizens, so it stores ["citizen"] directly.)

  frontend/app/(citizen)/layout.tsx
  frontend/app/(admin)/layout.tsx
      Logout now also clears smartgov_roles, not just smartgov_token,
      so a stale role marker can't linger after logging out.

Apply:
  1. Overwrite these 6 files in your repo with the versions in this
     zip (1 new file, 5 modified).
  2. No .env/config changes, no cache to clear.
  3. Test:
     - Visit /government directly — should show the hub page, not a
       404.
     - Log in as a citizen, then click "Government" (or any public
       nav link) — header should now show "My dashboard" instead of
       "Log in"/"Get started".
     - Log out — header should go back to showing Log in/Get started
       correctly.
     - Same check logged in as staff/admin — "My dashboard" should
       point to /admin/dashboard.

  git add -A
  git commit -m "Fix: missing /government page, public header not reflecting logged-in state"
  git push
