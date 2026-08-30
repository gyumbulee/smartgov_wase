<?php

use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\ServiceCategoryController as AdminServiceCategoryController;
use App\Http\Controllers\Api\V1\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\ServiceFeeController;
use App\Http\Controllers\Api\V1\Admin\ServiceFieldController;
use App\Http\Controllers\Api\V1\Admin\ServiceRequirementController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\CitizenRegistrationController;
use App\Http\Controllers\Api\V1\Auth\NinVerificationController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Citizen\ApplicationController;
use App\Http\Controllers\Api\V1\Citizen\ApplicationDocumentController;
use App\Http\Controllers\Api\V1\Citizen\DashboardController as CitizenDashboardController;
use App\Http\Controllers\Api\V1\Public\AnnouncementController;
use App\Http\Controllers\Api\V1\Public\DepartmentController;
use App\Http\Controllers\Api\V1\Public\LeadershipController;
use App\Http\Controllers\Api\V1\Public\NewsController;
use App\Http\Controllers\Api\V1\Public\ServiceController as PublicServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — versioned per spec §34
|--------------------------------------------------------------------------
| Phase 4 adds: the citizen application flow — create/save/submit/cancel,
| document uploads, and tracking. Payments and certificate generation
| remain schema-only until Phases 5–6; submission goes only as far as
| payment_pending / processing, honestly, per spec §11.
*/

Route::prefix('v1')->group(function () {

    // ---- Auth --------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
        Route::post('/reset-password', [PasswordResetController::class, 'reset']);

        // Citizen onboarding (spec §6): NIN verification, then account creation.
        Route::post('/nin/verify', [NinVerificationController::class, 'submit']);
        Route::get('/nin/status/{requestReference}', [NinVerificationController::class, 'status']);
        Route::post('/register/citizen', [CitizenRegistrationController::class, 'complete']);

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

        // Only active + published services are ever visible here.
        Route::get('/services', [PublicServiceController::class, 'index']);
        Route::get('/services/{slug}', [PublicServiceController::class, 'show']);
        Route::get('/service-categories', [PublicServiceController::class, 'categories']);
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
    });
});
