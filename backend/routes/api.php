<?php

use App\Http\Controllers\Api\V1\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Api\V1\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\CertificateTemplateController;
use App\Http\Controllers\Api\V1\Admin\CertificateTemplateFieldController;
use App\Http\Controllers\Api\V1\Admin\CertificateTemplateVersionController;
use App\Http\Controllers\Api\V1\Admin\CitizenController as AdminCitizenController;
use App\Http\Controllers\Api\V1\Admin\CommunityController as AdminCommunityController;
use App\Http\Controllers\Api\V1\Admin\ComplaintCategoryController as AdminComplaintCategoryController;
use App\Http\Controllers\Api\V1\Admin\ComplaintController as AdminComplaintController;
use App\Http\Controllers\Api\V1\Admin\ContactMessageController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\DepartmentController as AdminDepartmentController;
use App\Http\Controllers\Api\V1\Admin\DocumentCategoryController as AdminDocumentCategoryController;
use App\Http\Controllers\Api\V1\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Api\V1\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\V1\Admin\ExceptionQueueController;
use App\Http\Controllers\Api\V1\Admin\FacilityController as AdminFacilityController;
use App\Http\Controllers\Api\V1\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Api\V1\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Api\V1\Admin\HistoricalRecordController as AdminHistoricalRecordController;
use App\Http\Controllers\Api\V1\Admin\LeadershipController as AdminLeadershipController;
use App\Http\Controllers\Api\V1\Admin\LeadershipTermController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\NewsCategoryController as AdminNewsCategoryController;
use App\Http\Controllers\Api\V1\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Api\V1\Admin\NotablePeopleCategoryController as AdminNotablePeopleCategoryController;
use App\Http\Controllers\Api\V1\Admin\NotablePersonController as AdminNotablePersonController;
use App\Http\Controllers\Api\V1\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\V1\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\V1\Admin\ProjectUpdateController;
use App\Http\Controllers\Api\V1\Admin\ServiceCategoryController as AdminServiceCategoryController;
use App\Http\Controllers\Api\V1\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\ServiceFeeController;
use App\Http\Controllers\Api\V1\Admin\ServiceFieldController;
use App\Http\Controllers\Api\V1\Admin\ServiceRequirementController;
use App\Http\Controllers\Api\V1\Admin\StaffController;
use App\Http\Controllers\Api\V1\Admin\TourismCategoryController as AdminTourismCategoryController;
use App\Http\Controllers\Api\V1\Admin\TouristAttractionController;
use App\Http\Controllers\Api\V1\Admin\WardController as AdminWardController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\CitizenRegistrationController;
use App\Http\Controllers\Api\V1\Auth\NinVerificationController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Citizen\ApplicationController;
use App\Http\Controllers\Api\V1\Citizen\ApplicationDocumentController;
use App\Http\Controllers\Api\V1\Citizen\CertificateController as CitizenCertificateController;
use App\Http\Controllers\Api\V1\Citizen\ComplaintController as CitizenComplaintController;
use App\Http\Controllers\Api\V1\Citizen\DashboardController as CitizenDashboardController;
use App\Http\Controllers\Api\V1\Citizen\NotificationController;
use App\Http\Controllers\Api\V1\Citizen\PaymentController as CitizenPaymentController;
use App\Http\Controllers\Api\V1\Public\AnnouncementController;
use App\Http\Controllers\Api\V1\Public\CertificateVerificationController;
use App\Http\Controllers\Api\V1\Public\ContactController;
use App\Http\Controllers\Api\V1\Public\DepartmentController;
use App\Http\Controllers\Api\V1\Public\DocumentController as PublicDocumentController;
use App\Http\Controllers\Api\V1\Public\EventController as PublicEventController;
use App\Http\Controllers\Api\V1\Public\FacilityController as PublicFacilityController;
use App\Http\Controllers\Api\V1\Public\FaqController;
use App\Http\Controllers\Api\V1\Public\GalleryController as PublicGalleryController;
use App\Http\Controllers\Api\V1\Public\HistoryController;
use App\Http\Controllers\Api\V1\Public\LeadershipController;
use App\Http\Controllers\Api\V1\Public\MapController;
use App\Http\Controllers\Api\V1\Public\NewsController;
use App\Http\Controllers\Api\V1\Public\NotablePeopleController;
use App\Http\Controllers\Api\V1\Public\PaymentCallbackController;
use App\Http\Controllers\Api\V1\Public\PaymentStubController;
use App\Http\Controllers\Api\V1\Public\PaymentWebhookController;
use App\Http\Controllers\Api\V1\Public\ProjectController as PublicProjectController;
use App\Http\Controllers\Api\V1\Public\ServiceController as PublicServiceController;
use App\Http\Controllers\Api\V1\Public\TourismController;
use App\Http\Controllers\Api\V1\Public\WardController as PublicWardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — versioned per spec §34
|--------------------------------------------------------------------------
| Phase 8 adds: the rest of the public government portal — admin CRUD
| for News, Announcements, Leadership, Projects, Wards, Communities,
| Facilities, and Events, plus the public endpoints for the ones that
| never had them (Projects, Wards, Facilities, Events). Content follows
| the CMS pipeline where relevant (spec §51: draft -> published) — only
| published content is ever visible on the public site.
*/

Route::prefix('v1')->group(function () {

    // ---- Auth --------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
        Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:auth');
        Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:auth');

        // Citizen onboarding (spec §6): NIN verification, then account creation.
        Route::post('/nin/verify', [NinVerificationController::class, 'submit'])->middleware('throttle:nin-verify');
        Route::get('/nin/status/{requestReference}', [NinVerificationController::class, 'status']);
        Route::post('/register/citizen', [CitizenRegistrationController::class, 'complete'])->middleware('throttle:auth');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    // ---- Public --------------------------------------------------------
    Route::prefix('public')->group(function () {
        Route::get('/news', [NewsController::class, 'index']);
        Route::get('/news/{slug}', [NewsController::class, 'show']);
        Route::get('/announcements', [AnnouncementController::class, 'index']);
        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::get('/departments/{slug}', [DepartmentController::class, 'show']);
        Route::get('/leadership', [LeadershipController::class, 'index']);
        Route::get('/leadership/{slug}', [LeadershipController::class, 'show']);

        Route::get('/projects', [PublicProjectController::class, 'index']);
        Route::get('/projects/{slug}', [PublicProjectController::class, 'show']);
        Route::get('/wards', [PublicWardController::class, 'index']);
        Route::get('/wards/{slug}', [PublicWardController::class, 'show']);
        Route::get('/facilities', [PublicFacilityController::class, 'index']);
        Route::get('/events', [PublicEventController::class, 'index']);
        Route::get('/events/{slug}', [PublicEventController::class, 'show']);

        Route::get('/tourism', [TourismController::class, 'index']);
        Route::get('/tourism/categories', [TourismController::class, 'categories']);
        Route::get('/tourism/{slug}', [TourismController::class, 'show']);

        Route::get('/history', [HistoryController::class, 'index']);
        Route::get('/history/{slug}', [HistoryController::class, 'show']);

        Route::get('/notable-people', [NotablePeopleController::class, 'index']);
        Route::get('/notable-people/categories', [NotablePeopleController::class, 'categories']);
        Route::get('/notable-people/{slug}', [NotablePeopleController::class, 'show']);

        Route::get('/galleries', [PublicGalleryController::class, 'index']);
        Route::get('/galleries/{slug}', [PublicGalleryController::class, 'show']);

        Route::get('/map', [MapController::class, 'index']);

        Route::post('/contact', [ContactController::class, 'store']);
        Route::get('/complaint-categories', [\App\Http\Controllers\Api\V1\Public\ComplaintCategoryController::class, 'index']);
        Route::get('/faqs', [FaqController::class, 'index']);
        Route::get('/documents', [PublicDocumentController::class, 'index']);

        // Only active + published services are ever visible here.
        Route::get('/services', [PublicServiceController::class, 'index']);
        Route::get('/services/{slug}', [PublicServiceController::class, 'show']);
        Route::get('/service-categories', [PublicServiceController::class, 'categories']);

        // Payment gateway touchpoints — necessarily unauthenticated
        // (the gateway/browser hits these directly), but every one of
        // them re-verifies server-side rather than trusting inputs.
        Route::get('/payments/callback', PaymentCallbackController::class);
        Route::post('/payments/webhook', PaymentWebhookController::class);
        Route::post('/payments/stub/simulate', [PaymentStubController::class, 'simulate']);

        // Certificate verification (spec §21) — minimum necessary info only.
        Route::get('/certificates/verify', [CertificateVerificationController::class, 'verify']);
    });

    // ---- Citizen (requires citizen role) --------------------------------
    Route::prefix('citizen')->middleware(['auth:sanctum', 'role:citizen'])->group(function () {
        Route::get('/dashboard', [CitizenDashboardController::class, 'index']);

        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::post('/applications', [ApplicationController::class, 'store']);
        Route::get('/applications/{application}', [ApplicationController::class, 'show']);
        Route::put('/applications/{application}/fields', [ApplicationController::class, 'saveFields']);
        Route::post('/applications/{application}/submit', [ApplicationController::class, 'submit']);
        Route::post('/applications/{application}/cancel', [ApplicationController::class, 'cancel']);

        Route::post('/applications/{application}/documents', [ApplicationDocumentController::class, 'store']);
        Route::delete('/applications/{application}/documents/{document}', [ApplicationDocumentController::class, 'destroy']);

        Route::post('/applications/{application}/payments/initialize', [CitizenPaymentController::class, 'initialize']);
        Route::get('/applications/{application}/payments/current', [CitizenPaymentController::class, 'current']);
        Route::get('/payments', [CitizenPaymentController::class, 'history']);

        Route::get('/certificates', [CitizenCertificateController::class, 'index']);
        Route::get('/certificates/{certificate}', [CitizenCertificateController::class, 'show']);
        Route::get('/certificates/{certificate}/download', [CitizenCertificateController::class, 'download']);

        Route::get('/complaints', [CitizenComplaintController::class, 'index']);
        Route::post('/complaints', [CitizenComplaintController::class, 'store']);
        Route::get('/complaints/{complaint}', [CitizenComplaintController::class, 'show']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    });

    // ---- Admin (requires staff/admin role + specific permissions) ------
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:staff'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Services engine — gated by 'services.manage' (service_admin,
        // lga_admin, super_admin per RolePermissionSeeder). Fee changes
        // use the same permission since fee-setting is part of service
        // configuration, not a separate finance workflow, per business
        // decision to let any services.manage admin set fees.
        Route::middleware('permission:services.manage')->group(function () {
            Route::apiResource('service-categories', AdminServiceCategoryController::class)
                ->only(['index', 'store', 'update', 'destroy']);

            Route::apiResource('services', AdminServiceController::class)
                ->only(['index', 'store', 'show', 'update', 'destroy']);
            Route::post('/services/{service}/publish', [AdminServiceController::class, 'publish']);
            Route::post('/services/{service}/suspend', [AdminServiceController::class, 'suspend']);

            Route::get('/services/{service}/fees', [ServiceFeeController::class, 'index']);
            Route::post('/services/{service}/fees', [ServiceFeeController::class, 'store']);

            Route::get('/services/{service}/fields', [ServiceFieldController::class, 'index']);
            Route::post('/services/{service}/fields', [ServiceFieldController::class, 'store']);
            Route::put('/services/{service}/fields/{field}', [ServiceFieldController::class, 'update']);
            Route::delete('/services/{service}/fields/{field}', [ServiceFieldController::class, 'destroy']);

            Route::get('/services/{service}/requirements', [ServiceRequirementController::class, 'index']);
            Route::post('/services/{service}/requirements', [ServiceRequirementController::class, 'store']);
            Route::put('/services/{service}/requirements/{requirement}', [ServiceRequirementController::class, 'update']);
            Route::delete('/services/{service}/requirements/{requirement}', [ServiceRequirementController::class, 'destroy']);
        });

        Route::middleware('permission:payments.view')->group(function () {
            Route::get('/payments', [AdminPaymentController::class, 'index']);
        });

        // Certificate template engine — gated by 'templates.manage'
        // (certificate_admin, lga_admin, super_admin per RolePermissionSeeder).
        Route::middleware('permission:templates.manage')->group(function () {
            Route::apiResource('certificate-templates', CertificateTemplateController::class)
                ->only(['index', 'store', 'show', 'destroy']);

            Route::post('/certificate-templates/{certificateTemplate}/versions', [CertificateTemplateVersionController::class, 'store']);
            Route::post('/certificate-templates/{certificateTemplate}/versions/{version}/activate', [CertificateTemplateVersionController::class, 'activate']);

            Route::get('/certificate-template-versions/{version}/fields', [CertificateTemplateFieldController::class, 'index']);
            Route::post('/certificate-template-versions/{version}/fields', [CertificateTemplateFieldController::class, 'store']);
            Route::put('/certificate-template-versions/{version}/fields/{field}', [CertificateTemplateFieldController::class, 'update']);
            Route::delete('/certificate-template-versions/{version}/fields/{field}', [CertificateTemplateFieldController::class, 'destroy']);
        });

        // Staff/user provisioning — no public registration path for
        // admin accounts exists anywhere in the platform; they only
        // ever come from here.
        Route::middleware('permission:users.view')->group(function () {
            Route::get('/users', [StaffController::class, 'index']);
            Route::get('/roles', [StaffController::class, 'roles']);
        });
        Route::middleware('permission:users.manage')->group(function () {
            Route::post('/users', [StaffController::class, 'store']);
            Route::put('/users/{user}/role', [StaffController::class, 'updateRole']);
            Route::post('/users/{user}/suspend', [StaffController::class, 'suspend']);
            Route::post('/users/{user}/reactivate', [StaffController::class, 'reactivate']);
        });

        // Departments — index is reachable by any staff role (no
        // specific permission) since it's low-sensitivity reference
        // data needed broadly, most immediately for the department
        // picker in staff account creation above.
        Route::get('/departments', [AdminDepartmentController::class, 'index']);
        Route::middleware('permission:departments.manage')->group(function () {
            Route::post('/departments', [AdminDepartmentController::class, 'store']);
            Route::put('/departments/{department}', [AdminDepartmentController::class, 'update']);
            Route::delete('/departments/{department}', [AdminDepartmentController::class, 'destroy']);
        });

        // Citizen oversight — read-only; identity data only ever comes
        // from verified NIN, never admin edits (spec §8).
        Route::middleware('permission:citizens.view')->group(function () {
            Route::get('/citizens', [AdminCitizenController::class, 'index']);
            Route::get('/citizens/{citizen}', [AdminCitizenController::class, 'show']);
        });

        // Application oversight — monitoring, not manual approval (spec §27).
        Route::middleware('permission:applications.view')->group(function () {
            Route::get('/applications', [AdminApplicationController::class, 'index']);
            Route::get('/applications/{application}', [AdminApplicationController::class, 'show']);
        });

        // Exception queue (spec §69) — where a failed automated step
        // (e.g. certificate generation with no template configured)
        // surfaces for an admin to fix and retry. Gated on
        // 'certificates.manage' rather than 'applications.manage' —
        // certificate_admin (the role that actually fixes a missing
        // template) has the former but not the latter per the Phase 1
        // seeder, and every job currently in this queue is
        // certificate-generation-related.
        Route::middleware('permission:certificates.manage')->group(function () {
            Route::get('/exceptions', [ExceptionQueueController::class, 'index']);
            Route::post('/exceptions/{job}/retry', [ExceptionQueueController::class, 'retry']);
        });

        Route::middleware('permission:audit.view')->group(function () {
            Route::get('/audit-logs', [AuditLogController::class, 'index']);
        });

        // Complaints (spec §47) — a genuine manual workflow, unlike
        // certificate applications. Contact messages share the same
        // gate since both are inbound-citizen-correspondence queues
        // and no dedicated permission exists for either.
        Route::middleware('permission:complaints.manage')->group(function () {
            Route::apiResource('complaint-categories', AdminComplaintCategoryController::class)
                ->parameters(['complaint-categories' => 'category'])
                ->only(['index', 'store', 'destroy']);

            Route::get('/complaints', [AdminComplaintController::class, 'index']);
            Route::get('/complaints/{complaint}', [AdminComplaintController::class, 'show']);
            Route::put('/complaints/{complaint}/status', [AdminComplaintController::class, 'updateStatus']);

            Route::get('/contact-messages', [ContactMessageController::class, 'index']);
            Route::put('/contact-messages/{contactMessage}/status', [ContactMessageController::class, 'updateStatus']);
        });

        // News CMS — gated by 'news.publish' (content_admin, lga_admin,
        // super_admin). Editorial pipeline per spec §51: draft -> review
        // -> approved -> published; only publish() sets published_at.
        Route::middleware('permission:news.publish')->group(function () {
            Route::apiResource('news-categories', AdminNewsCategoryController::class)
                ->only(['index', 'store', 'update', 'destroy']);

            Route::apiResource('news', AdminNewsController::class)
                ->only(['index', 'store', 'show', 'update', 'destroy']);
            Route::post('/news/{news}/publish', [AdminNewsController::class, 'publish']);
        });

        // General civic content — gated by 'content.manage'
        // (content_admin, lga_admin, super_admin).
        Route::middleware('permission:content.manage')->group(function () {
            // Public-content image uploads — stores on the 'public' disk,
            // distinct from citizen document/certificate storage. See
            // MediaController for why this separation is load-bearing,
            // not cosmetic.
            Route::post('/media', [MediaController::class, 'store']);
            Route::delete('/media/{media}', [MediaController::class, 'destroy']);

            Route::apiResource('announcements', AdminAnnouncementController::class)
                ->only(['index', 'store', 'update', 'destroy']);

            Route::apiResource('leadership', AdminLeadershipController::class)
                ->parameters(['leadership' => 'leader'])
                ->only(['index', 'store', 'show', 'update', 'destroy']);
            Route::post('/leadership/{leader}/terms', [LeadershipTermController::class, 'store']);
            Route::put('/leadership/{leader}/terms/{term}', [LeadershipTermController::class, 'update']);
            Route::delete('/leadership/{leader}/terms/{term}', [LeadershipTermController::class, 'destroy']);

            Route::apiResource('wards', AdminWardController::class)
                ->only(['index', 'store', 'update', 'destroy']);
            Route::apiResource('communities', AdminCommunityController::class)
                ->only(['index', 'store', 'update', 'destroy']);
            Route::apiResource('facilities', AdminFacilityController::class)
                ->only(['index', 'store', 'update', 'destroy']);

            Route::apiResource('events', AdminEventController::class)
                ->only(['index', 'store', 'update', 'destroy']);
            Route::post('/events/{event}/publish', [AdminEventController::class, 'publish']);

            // Discover Wase (spec §28: content_admin manages "News,
            // History, Tourism, People, Events, Gallery" — same
            // permission as the rest of this group).
            Route::apiResource('tourism-categories', AdminTourismCategoryController::class)
                ->only(['index', 'store', 'update', 'destroy']);
            Route::apiResource('tourist-attractions', TouristAttractionController::class)
                ->parameters(['tourist-attractions' => 'attraction'])
                ->only(['index', 'store', 'show', 'update', 'destroy']);
            Route::post('/tourist-attractions/{attraction}/media', [TouristAttractionController::class, 'attachMedia']);
            Route::delete('/tourist-attractions/{attraction}/media/{media}', [TouristAttractionController::class, 'detachMedia']);

            Route::apiResource('historical-records', AdminHistoricalRecordController::class)
                ->parameters(['historical-records' => 'record'])
                ->only(['index', 'store', 'update', 'destroy']);
            Route::post('/historical-records/{record}/publish', [AdminHistoricalRecordController::class, 'publish']);

            Route::apiResource('notable-people-categories', AdminNotablePeopleCategoryController::class)
                ->parameters(['notable-people-categories' => 'category'])
                ->only(['index', 'store', 'destroy']);
            Route::apiResource('notable-people', AdminNotablePersonController::class)
                ->parameters(['notable-people' => 'person'])
                ->only(['index', 'store', 'show', 'update', 'destroy']);
            Route::post('/notable-people/{person}/publish', [AdminNotablePersonController::class, 'publish']);

            Route::apiResource('galleries', AdminGalleryController::class)
                ->only(['index', 'store', 'show', 'update', 'destroy']);
            Route::post('/galleries/{gallery}/media', [AdminGalleryController::class, 'attachMedia']);
            Route::delete('/galleries/{gallery}/media/{media}', [AdminGalleryController::class, 'detachMedia']);

            Route::apiResource('faqs', AdminFaqController::class)
                ->only(['index', 'store', 'update', 'destroy']);

            Route::apiResource('document-categories', AdminDocumentCategoryController::class)
                ->parameters(['document-categories' => 'category'])
                ->only(['index', 'store', 'destroy']);
            Route::apiResource('documents', AdminDocumentController::class)
                ->only(['index', 'store', 'destroy']);
        });

        // Projects — gated by 'projects.manage' (project_admin,
        // lga_admin, super_admin).
        Route::middleware('permission:projects.manage')->group(function () {
            Route::apiResource('projects', AdminProjectController::class)
                ->only(['index', 'store', 'show', 'update', 'destroy']);
            Route::post('/projects/{project}/updates', [ProjectUpdateController::class, 'store']);
            Route::delete('/projects/{project}/updates/{updateId}', [ProjectUpdateController::class, 'destroy']);
        });
    });
});
