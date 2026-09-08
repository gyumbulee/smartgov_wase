# SmartGov-Wase — Phase 10 Delta (Civic Engagement)

Per spec §38 Phase 10: Complaints, Contact, FAQs, Documents,
Notifications. All models for this phase already existed since Phase 1
— nothing had ever been built on top of them until now. No new
migrations, no new dependencies.

## Complaints (spec §47) — the platform's one genuine manual workflow

Unlike certificate applications, complaints are explicitly *not*
automated — staff work these by hand, and every status change is
recorded as a real `complaint_updates` entry, giving citizens an
honest timeline rather than a synthetic one.

- **Citizen:** submit a complaint (category, title, description,
  location), view own complaints with full status history.
- **Admin:** list/filter by status, view detail, update status with an
  optional note to the citizen, manage complaint categories.
- Gated by the existing `complaints.manage` permission (currently only
  `super_admin`/`lga_admin` have it, per the Phase 1 seeder — no new
  role was invented for this).

**A missing relation caught along the way:** `ComplaintCategory` had no
`complaints()` relation despite the controller needing
`$category->complaints()->exists()` to block deleting a category still
in use. Added.

## Contact, FAQs, Documents

- **Contact:** public submission form (no auth) → `contact_messages`;
  admin inbox with status workflow (new/read/in_progress/resolved/spam).
- **FAQs:** admin CRUD; public listing filterable by service or category
  (so a service detail page could eventually show only its own FAQs).
- **Documents:** admin upload (PDF/Word/Excel, 10MB max) and public
  library with search. Like Phase 8/8-followup's content images, these
  go on the **public** disk — distinct from Phase 4's citizen
  application documents, which stay on the private `local` disk.
  Public documents are meant to be downloadable by anyone; citizen
  documents never are.

**Another missing relation caught:** `DocumentCategory` had no
`documents()` relation, needed for the same "block delete if in use"
guard. Added.

## Notifications — closing a gap open since Phase 5

Notifications have been created internally since Phase 5 (payment
confirmed) and Phase 6 (certificate ready) — but there was **never an
endpoint or page to view them**. The bell icon in the citizen header
has been purely decorative since Phase 4. Now:

- `GET /citizen/notifications` (paginated list), `/unread-count`,
  `POST /{id}/read`, `POST /read-all`.
- The header bell now shows a real unread-count badge and links to a
  proper notification center page (spec §24's read/unread + mark-all
  pattern).

## A routing bug caught before shipping

`publicCivicService.complaintCategories()` initially pointed at
`/admin/complaint-categories` — which is gated by `permission:complaints.manage`.
An unauthenticated (or authenticated-but-non-admin) citizen filing a
complaint would have gotten a 403 just trying to load the category
dropdown. Fixed by adding a proper public endpoint
(`GET /public/complaint-categories`, read-only, active categories only)
and pointing the frontend at that instead.

## Three more 404s closed

The public nav/footer have linked to `/contact` (top nav, since Phase 1),
`/documents`, and `/faq` (footer, since Phase 1) — all three 404'd
until now, same pattern as `/discover`, `/leadership`, and `/departments`
being dead links from Phase 1 through Phase 8/9. All three are real
pages now.

## MODIFIED FILES

| File | What changed |
|---|---|
| `backend/app/Models/Complaints/ComplaintCategory.php` | Added `complaints()` relation. |
| `backend/app/Models/Content/DocumentCategory.php` | Added `documents()` relation. |
| `backend/routes/api.php` | All new citizen/admin/public routes for this phase. |
| `frontend/app/(citizen)/layout.tsx` | Bell icon now shows a real unread badge and links to `/notifications`; added "Complaints" nav link. |
| `frontend/app/(admin)/layout.tsx` | Added Complaints, Contact Messages, FAQs, Documents nav links (26 items now — the scrollable sidebar handles it). |

## Business rules applied

- **Complaints are honest about being manual.** No automated
  "processing" language anywhere in this flow — status changes only
  happen when an admin explicitly makes them, and the reason is always
  recorded.
- **Public vs. private document storage stays consistent** with the
  separation established in Phase 8/8-followup: anything meant for
  public download uses the `public` disk; anything citizen-specific
  stays on `local`. This phase didn't blur that line.
- **Contact form has no auth requirement** — matches spec's framing of
  it as a general public inquiry channel, not a citizen-account feature.

## Known limitations carried forward

- **No file attachments on complaints** — a citizen reporting a
  pothole can't attach a photo. The `complaints` table has no
  media/attachment column; adding one would need a small schema
  addition. Flag if this is worth prioritizing.
- **No notification preferences UI** — `notification_preferences`
  table exists since Phase 1 (email/SMS toggles per notification type)
  but nothing reads or writes it yet. All notifications are in-app/
  database-only regardless of what a citizen might want.
- **FAQ categories are freeform strings**, not a managed taxonomy like
  News/Tourism categories — matches the schema (`faqs.category` is a
  plain string column, not a foreign key), so no admin "manage FAQ
  categories" page was needed, but also means no autocomplete/dropdown
  when creating one — just a text field.

## Setup after applying

No new dependencies or migrations. Just drop the files in.

```bash
cd backend
composer dump-autoload
```
