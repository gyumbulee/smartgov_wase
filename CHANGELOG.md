# SmartGov-Wase — Phase 8 Follow-up (Image Uploads + Missing Public Pages + Leadership Reorder)

Closes three of the four items flagged at the end of the Phase 8 delta.
The fourth (response-shape consistency) remains an open, non-urgent
item — not addressed here, still flagged for a dedicated pass.

## 1. Image uploads — the most consequential fix

**A security-relevant design decision came before any code:** application
documents and certificate PDFs are stored on the **private** `local`
disk (correct — they must never be publicly reachable by URL). Content
images (news, leadership, events) need to be **publicly viewable**. A
naive "serve any media by ID" endpoint would have let anyone download
private citizen documents just by guessing an ID. Instead:

- New uploads for public content go to a **separate `public` disk**,
  handled by a controller (`MediaController`) that has no ownership
  check and no reason for one — everything through it is meant to be
  public. `ApplicationDocumentController` and certificate generation
  are untouched and still use `local`.

### NEW FILES
| File | Purpose |
|---|---|
| `backend/app/Http/Requests/Admin/UploadMediaRequest.php` | Validates image uploads (5MB max, images only). |
| `backend/app/Http/Resources/MediaResource.php` | Returns the uploaded media's public URL, dimensions, alt text. |
| `backend/app/Http/Controllers/Api/V1/Admin/MediaController.php` | `POST /admin/media` (upload), `DELETE /admin/media/{media}` — refuses to delete anything not on the `public` disk, as a second guard against misuse. |
| `frontend/components/admin/ImageUploadField.tsx` | Reusable upload-with-preview component — used identically across News, Leadership, and Events. |

### MODIFIED
| File | What changed |
|---|---|
| `StoreNewsRequest.php`, `StoreLeadershipRequest.php`, `StoreEventRequest.php` | Accept `featured_image_id` / `photo_media_id`. |
| `NewsResource.php`, `LeadershipResource.php`, `EventResource.php` | Resolve and return the image URL when set. |
| `routes/api.php` | Added the media routes, gated by `content.manage` (the only role with `news.publish` — `content_admin` — already has `content.manage` too, so no gap). |
| Admin News/Leadership/Events pages | Wired `ImageUploadField` into each create/edit modal. |
| Public News (list + detail) and Leadership pages | Now display the uploaded image; leadership falls back to the placeholder icon when no photo is set. |

**⚠️ Operational requirement this introduces:** unlike Phase 4's
document uploads (which deliberately skip `storage:link` since they're
private), **these images need it**:

```bash
php artisan storage:link
```

Without this, uploaded image URLs will 404.

## 2. Public Wards and Facilities pages

Both had working backend endpoints since the original Phase 8 delta
but no frontend page. Now:

- `/wards` — list with community counts, linking to `/wards/[slug]`
- `/wards/[slug]` — ward detail with its communities
- `/facilities` — directory filterable by type (government office, school, health facility, market, community facility, other)

## 3. Leadership reordering

Up/down arrow buttons on each profile card in `/admin/leadership`,
swapping `display_order` with the adjacent profile. Not full
drag-and-drop, but closes the actual gap (there was previously no way
to reorder at all).

**One bug caught before it shipped:** `StoreLeadershipRequest` is
shared between create and update, with `name` and `position` marked
`required`. A naive reorder call sending only `{display_order}` would
have failed validation. Fixed by having the reorder handler include
the profile's existing `name`/`position` in the payload rather than
loosening the shared request's validation rules (which would have
weakened validation for the full edit-profile flow too).

## Still open

- **Response-shape consistency** (raw JSON vs. `{data: ...}` wrapping)
  — flagged in the original Phase 8 delta, not touched here. Still a
  candidate for a dedicated standardization pass, not urgent.
- **Reordering for other `sort_order`/`display_order` fields**
  (departments, service categories, ward listing order) — only
  Leadership got this treatment. The same pattern could be replicated
  for the others on request.
- **Image galleries** (multiple images per item, using the
  `mediables` polymorphic table) — this pass only wired up a single
  featured image per content type. Full gallery support is more
  relevant to Phase 9 (Tourism, heavily gallery-driven per spec §74.6)
  and is better scoped there.

## Setup after applying

```bash
cd backend
composer dump-autoload
php artisan storage:link   # required — new for this delta, uploaded images 404 without it
```

No new dependencies.
