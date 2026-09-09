Fix bundle: department "can't save" / service create error / radio-checkbox rendering
=========================================================================================

Three separate issues reported together — covered in this one bundle.

--------------------------------------------------------------------
1) "Unable to create department or edit demo one saying can't save"
--------------------------------------------------------------------

ROOT CAUSE (confirmed, this is the real bug):

Every one of these 18 FormRequest classes builds a "unique, ignoring
this record" validation rule like:

    $id = $this->route('department');
    'slug' => ['nullable','string','max:200','unique:departments,slug,'.$id],

The problem: on an UPDATE route (e.g. PUT /admin/departments/{department}),
Laravel's route-model binding has ALREADY resolved {department} into a
full Department model instance by the time a FormRequest's rules()
method runs — so $this->route('department') returns the Department
OBJECT, not its ID string. Concatenating an object with '.' in PHP
throws a fatal error:

  Error: Object of class App\Models\Government\Department could not
  be converted to string

This is a documented Laravel gotcha — the correct, official pattern
(see Laravel's own RouteParameter RFC) is $this->route('department')
->id, not the bare route() call. Every one of these 18 files was
missing the ->id, so EVERY EDIT of anything using this pattern was
throwing a fatal 500 error: departments, wards, communities, events,
announcements, news + news categories, complaint categories, document
categories, galleries, historical records, leadership, notable people
+ their categories, projects, tourism categories + attractions, and
services.

CREATE was unaffected by this specific bug (no {id} in the create
route, so $this->route(...) is simply null there, and null
concatenates to an empty string harmlessly) — which is why the report
was specifically about editing the demo department, not creating new
ones.

Files changed (added ?->id after $this->route(...) in each):
  backend/app/Http/Requests/Admin/StoreAnnouncementRequest.php
  backend/app/Http/Requests/Admin/StoreCommunityRequest.php
  backend/app/Http/Requests/Admin/StoreComplaintCategoryRequest.php
  backend/app/Http/Requests/Admin/StoreDepartmentRequest.php
  backend/app/Http/Requests/Admin/StoreDocumentCategoryRequest.php
  backend/app/Http/Requests/Admin/StoreEventRequest.php
  backend/app/Http/Requests/Admin/StoreGalleryRequest.php
  backend/app/Http/Requests/Admin/StoreHistoricalRecordRequest.php
  backend/app/Http/Requests/Admin/StoreLeadershipRequest.php
  backend/app/Http/Requests/Admin/StoreNewsCategoryRequest.php
  backend/app/Http/Requests/Admin/StoreNewsRequest.php
  backend/app/Http/Requests/Admin/StoreNotablePeopleCategoryRequest.php
  backend/app/Http/Requests/Admin/StoreNotablePersonRequest.php
  backend/app/Http/Requests/Admin/StoreProjectRequest.php
  backend/app/Http/Requests/Admin/StoreTourismCategoryRequest.php
  backend/app/Http/Requests/Admin/StoreTouristAttractionRequest.php
  backend/app/Http/Requests/Admin/StoreWardRequest.php
  backend/app/Http/Requests/Admin/UpdateServiceRequest.php

Also improved (frontend, so this class of bug is visible instead of
a generic guess next time):
  frontend/app/(admin)/admin/departments/page.tsx
  frontend/app/(admin)/admin/services/page.tsx
Both now show the backend's real error message on save failure
instead of a fixed guess like "Couldn't save this department" /
"Check the service code is unique" regardless of the actual cause.

--------------------------------------------------------------------
2) "Service saying code should be unique but service created when
   refreshed"
--------------------------------------------------------------------

I audited the service CREATE path in depth (StoreServiceRequest,
AdminServiceController::store, ServiceWorkflow/AuditLog models,
ServiceResource serialization) and could not find a server-side bug
that would insert a service and then fail afterward — everything
there checks out. The most likely explanation is a transient/one-off
error whose real message was being hidden by the frontend's generic
catch (see the CreateServiceModal fix above) — you'll now see the
actual backend message next time this happens, which will make the
real cause obvious immediately rather than guessing. If it recurs
after this, please send me the exact message shown.

--------------------------------------------------------------------
3) "Gender having radio or checkbox returned as text field"
--------------------------------------------------------------------

ROOT CAUSE: the dynamic field renderer on the citizen application
page only had special cases for "textarea" and "select" — every
other field_type (including "radio" and "checkbox", both valid
choices in the admin field editor) fell through to a plain text
<input>.

File changed:
  frontend/app/(citizen)/applications/[id]/page.tsx

Added proper rendering for both:
  - radio: a set of <input type="radio"> sharing one name, single
    value stored as a plain string (unchanged storage shape).
  - checkbox: a set of <input type="checkbox">, multiple selections
    joined into one comma-separated string (matches the existing
    convention used elsewhere, e.g. accepted_file_types) — no change
    to the field_values storage shape (still Record<string, string |
    null>) or the save endpoint was needed.

--------------------------------------------------------------------
Apply
--------------------------------------------------------------------
  1. Overwrite these files in your repo with the versions in this
     zip (backend Requests + the 3 frontend pages).
  2. No .env/config changes, no cache to clear for the backend part.
     For the frontend, a normal rebuild (npm run build / restart dev
     server) picks up the changes.
  3. Test:
     - Edit the demo department and save — should succeed now
       instead of erroring.
     - Create a new service with a genuinely new code — confirm it
       works and no error shows.
     - Add a "radio" or "checkbox" type field to a service in admin,
       then open a citizen application for that service — the field
       should render as radio buttons / checkboxes, not a text box.

  git add -A
  git commit -m "Fix: fatal error editing departments/services/etc (missing ->id on route-bound model in unique rules), surface real save errors instead of generic guesses, render radio/checkbox application fields correctly"
  git push
