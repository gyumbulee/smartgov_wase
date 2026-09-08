SmartGov WASE — fix bundle #3
==============================

Extract over your repo root (same folder that contains backend/ and
frontend/). This bundle is cumulative — it includes everything from
fix bundles #1 and #2 plus the new fix below.

1) DELETE these old, wrongly-placed files first (still exist at the
   old path in your repo and need to be removed, not just shadowed):

     frontend/app/(admin)/history/page.tsx
     frontend/app/(admin)/tourism/page.tsx
     frontend/app/(admin)/tourism/[id]/page.tsx
     frontend/app/(admin)/notable-people/page.tsx
     frontend/app/(admin)/galleries/page.tsx
     frontend/app/(admin)/galleries/[id]/page.tsx

   Fix #1 — these were one folder level too shallow, causing
   /admin/history, /admin/tourism, /admin/notable-people and
   /admin/galleries to 404.

2) Extract this zip into the repo root. New/changed files:

   Fix #2 — citizen application detail page stuck on "Loading...":
     frontend/app/(citizen)/applications/[id]/page.tsx
     frontend/types/application.ts
     backend/app/Http/Controllers/Api/V1/Citizen/ApplicationController.php
     backend/app/Http/Resources/ApplicationResource.php
   Was calling the PUBLIC /public/services/{slug} endpoint to get
   service details for an application already submitted — that
   endpoint 404s once a service is suspended/unpublished. Now the
   full service (with fields/requirements) is embedded directly in
   the application response, so no second call is made.

   Fix #3 — "Table 'application_status_histories' doesn't exist":
     backend/app/Models/Applications/ApplicationStatusHistory.php
   The migration named the table in the singular
   (application_status_history) but Eloquent's default convention
   pluralizes it. Added an explicit $table override.

   Fix #4 — "Field 'id' doesn't have a default value" (this is the
   one behind your payment-failure notification crash, but it was
   NOT limited to notifications — it silently affects every table
   below the same way, the first time a row is inserted):
     backend/app/Models/Applications/ApplicationStatusHistory.php
     backend/app/Models/Certificates/Certificate.php
     backend/app/Models/Certificates/CertificateTemplate.php
     backend/app/Models/Certificates/CertificateTemplateField.php
     backend/app/Models/Certificates/CertificateTemplateVersion.php
     backend/app/Models/Certificates/CertificateVerification.php
     backend/app/Models/Complaints/Complaint.php
     backend/app/Models/Complaints/ComplaintCategory.php
     backend/app/Models/Complaints/ComplaintUpdate.php
     backend/app/Models/Content/Announcement.php
     backend/app/Models/Content/ContactMessage.php
     backend/app/Models/Content/Document.php
     backend/app/Models/Content/DocumentCategory.php
     backend/app/Models/Content/Event.php
     backend/app/Models/Content/Faq.php
     backend/app/Models/Content/News.php
     backend/app/Models/Content/NewsCategory.php
     backend/app/Models/Content/Page.php
     backend/app/Models/Discover/HistoricalRecord.php
     backend/app/Models/Discover/NotablePeopleCategory.php
     backend/app/Models/Discover/TourismCategory.php
     backend/app/Models/Media/Gallery.php
     backend/app/Models/Media/Media.php
     backend/app/Models/Payments/PaymentWebhookEvent.php
     backend/app/Models/Payments/Receipt.php
     backend/app/Models/Projects/Project.php
     backend/app/Models/Projects/ProjectUpdate.php
     backend/app/Models/System/AuditLog.php
     backend/app/Models/System/Notification.php
     backend/app/Models/System/Setting.php
   Every one of these models had `use Illuminate\Database\Eloquent\
   Concerns\HasUlids;` at the TOP of the file (a namespace import)
   but never actually applied the trait inside the class body with
   `use HasUlids;`. The import alone does nothing — without applying
   the trait, Eloquent never generates a ULID before insert, and
   since these tables' `id` column has no database default, every
   INSERT on any of these 29 tables fails with "Field 'id' doesn't
   have a default value". This is why your notification insert broke
   after a failed payment — but the same crash is waiting on
   certificates, complaints, news, events, galleries, receipts,
   audit logs, project updates, and more, the first time each of
   those code paths runs.

   Fix #5 — 404 on /applications/{id} right after payment callback:
     backend/config/payment.php                (new file)
     backend/.env.example                       (documents FRONTEND_URL)
   `config('payment.frontend_url')` was referenced in three places
   (StubPaymentGateway, PaymentCallbackController,
   CertificateGenerationService) but config/payment.php never
   existed — so it always resolved to null. That turned the payment
   callback's redirect into a bare relative path ("/applications/{id}"
   instead of "http://localhost:3000/applications/{id}"). The mock
   checkout page happened to still work because the browser was
   already on the frontend origin at that point, but the *callback*
   is hit as a direct browser navigation against the backend's own
   origin — so the relative redirect kept the browser on the
   backend, which has no such web route, hence the 404.
   The new config file defaults frontend_url to
   http://localhost:3000 (the standard Next.js dev port), so this
   should work immediately even without touching your local .env. If
   your frontend runs on a different port/host, add
   FRONTEND_URL=http://your-host:port to your actual .env (not
   .env.example) and run `php artisan config:clear` if you've ever
   cached config.

3) Verify, commit, push:

     git status
     git add -A
     git commit -m "Fix admin route placement, citizen application loading, status history table name, missing HasUlids trait on 29 models, and missing payment.frontend_url config"
     git push
