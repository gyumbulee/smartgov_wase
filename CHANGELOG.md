# SmartGov-Wase — Phase 4 Delta (Applications: Forms, Documents, Tracking)

Per spec §38 Phase 4: application forms driven by the Phase 3 dynamic
field engine, file uploads against configured requirements, application
status tracking, and citizen-facing dashboard/list/detail pages.

No new migrations — Phase 1's schema (`applications`,
`application_field_values`, `application_documents`,
`application_status_history`) already covers everything here.

## NEW FILES

### Backend
| File | Purpose |
|---|---|
| `app/Actions/Applications/CreateApplicationAction.php` | Creates a draft application and **snapshots the service's current configuration** (fields, requirements, fee) onto it per spec §77 — later fee/field changes never silently rewrite what a citizen already applied under. |
| `app/Actions/Applications/SubmitApplicationAction.php` | Validates required fields and required documents are present, then transitions status **honestly**: `payment_pending` if the service requires payment, `processing` if it doesn't. No fake "officer reviewing" state (spec §11). |
| `app/Http/Requests/Citizen/CreateApplicationRequest.php`, `SaveApplicationFieldsRequest.php`, `UploadApplicationDocumentRequest.php` | Request validation. |
| `app/Http/Resources/ApplicationResource.php`, `ApplicationDocumentResource.php`, `ApplicationStatusHistoryResource.php` | API response shapes — an application never exposes another citizen's data, and ownership is checked server-side on every controller action, not inferred from the URL. |
| `app/Http/Controllers/Api/V1/Citizen/ApplicationController.php` | `POST /citizen/applications` (create/resume draft), `GET /citizen/applications` (list mine), `GET /citizen/applications/{id}`, `PUT .../fields` (save progress), `POST .../submit`, `POST .../cancel`. |
| `app/Http/Controllers/Api/V1/Citizen/ApplicationDocumentController.php` | Upload/delete documents against a specific requirement. Validates file type and size **against that requirement's own configured limits**, not just a generic cap. |

### Frontend
| File | Purpose |
|---|---|
| `types/application.ts` | TypeScript types for applications, documents, status history. |
| `services/applicationService.ts` | API calls: `list`, `get`, `createForService`, `saveFields`, `uploadDocument`, `deleteDocument`, `submit`, `cancel`. |
| `app/(citizen)/layout.tsx` | Citizen portal chrome — top nav, distinct from the public site and admin portal. |
| `app/(citizen)/dashboard/page.tsx` | Identity/eligibility status, application count, quick actions. |
| `app/(citizen)/applications/page.tsx` | List of the citizen's own applications with status badges. |
| `app/(citizen)/applications/[id]/page.tsx` | The core of this phase — renders the service's dynamic fields (text/textarea/select/date/number) from Phase 3's field engine, handles document upload/removal per requirement, shows submission validation errors inline, and displays the full status timeline. |

## MODIFIED FILES

| File | What changed |
|---|---|
| `backend/routes/api.php` | Added the citizen application routes under `/citizen/applications/*`, all gated by `auth:sanctum` + `role:citizen`. |
| `frontend/app/(public)/services/[slug]/page.tsx` | "Apply for this service" now actually does something: creates (or resumes) an application and routes into the application detail page. Sends unauthenticated visitors to `/register` first. |

## Important: a schema-correctness fix along the way

While wiring document uploads I caught that `application_documents.media_id`
is a ULID column meant to reference the `media` table (per spec §39/§52's
central polymorphic media system) — not a place to store a raw file path.
Storing a path there would have overflowed the column and broken on a
real database. Fixed: uploads now create a proper `Media` record first
and store *that record's id* in `media_id`. This also means uploaded
documents get the same metadata (filename, mime type, size) tracked
consistently with every other media in the platform.

## Business rules applied

- A citizen can only create an application for an **active + published**
  service (drafts/suspended services are rejected server-side, not just
  hidden in the UI).
- A citizen must have **verified identity** before applying — checked
  server-side in `ApplicationController::store`, matching the account
  eligibility gate from your earlier decision (only Wase, Plateau
  residents ever reach this point anyway, but the check is explicit
  here too).
- Revisiting a service you already have a draft for **resumes that
  draft** rather than creating duplicates.
- Submission validates against the field/requirement **snapshot taken
  when the application was created**, not the service's current
  configuration — so an admin editing a service's fields mid-application
  doesn't retroactively invalidate someone's in-progress submission.

## Known limitations carried into Phase 5

- `payment_pending` is a dead end for now — there's no gateway wired up,
  so paid services stop there until Phase 5 (Flutterwave integration).
  The application detail page shows an honest "payment isn't wired up
  yet" message rather than pretending to process anything.
- `processing` (for free services) is also a dead end — nothing consumes
  the `ServiceWorkflow` definition yet to actually generate a
  certificate. That's Phase 6.
- No admin-side application queue/exception view yet (spec §69) — that
  becomes relevant once Phases 5–6 give applications somewhere to
  actually fail.

## Setup after applying

```bash
cd backend
composer dump-autoload
# No `storage:link` needed — application documents intentionally use the
# private 'local' disk (not 'public'), since citizen documents must never
# be reachable by a guessable URL. Just confirm storage/app is writable.
```

No new frontend dependencies.
