# SmartGov-Wase — Field & Requirement Builder UI

Fills the gap flagged at the end of the Phase 3 delta: admin UI for
managing a service's dynamic application fields and document
requirements. No backend changes were needed — the CRUD endpoints for
this already existed from Phase 3 (`ServiceFieldController`,
`ServiceRequirementController`); this delta is frontend-only.

## NEW FILES

| File | Purpose |
|---|---|
| `frontend/app/(admin)/services/[id]/page.tsx` | Service detail page with two tabs: **Application fields** and **Requirements**. Each supports add/edit/delete via modal forms, hitting the existing Phase 3 admin API. Field type selector covers all 11 types the schema supports (text, textarea, date, select, radio, checkbox, number, email, phone, file, address); `options` input only appears for select/radio/checkbox and is comma-separated in the UI, array in the API payload. |

## MODIFIED FILES

| File | What changed |
|---|---|
| `frontend/services/serviceService.ts` | Added `adminGet`, `adminCreateField`, `adminUpdateField`, `adminDeleteField`, `adminCreateRequirement`, `adminUpdateRequirement`, `adminDeleteRequirement`. |
| `frontend/app/(admin)/services/page.tsx` | Service names now link to `/admin/services/{id}`. Added a "Manage" action next to Publish/Suspend so the new builder page is actually reachable. |

## Notes

- Field/requirement ordering uses the order they were created in
  (`sort_order` auto-increments); there's no drag-to-reorder yet. Flag
  if you want that — it'd touch the same page plus a small reorder
  endpoint on the backend.
- System fields (`is_system_field = true`) are blocked from edit/delete
  at the API level already (Phase 3); none exist yet since nothing
  currently creates them, but the guard is in place for when
  application-engine system fields (Phase 4) start appearing here.

## Setup

No new dependencies, no migrations. Just drop the files in and restart
`npm run dev` if it's already running.
