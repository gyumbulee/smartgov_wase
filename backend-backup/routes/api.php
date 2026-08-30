<?php

use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Citizen\DashboardController as CitizenDashboardController;
use App\Http\Controllers\Api\V1\Public\AnnouncementController;
use App\Http\Controllers\Api\V1\Public\DepartmentController;
use App\Http\Controllers\Api\V1\Public\LeadershipController;
use App\Http\Controllers\Api\V1\Public\NewsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — versioned per spec §34
|--------------------------------------------------------------------------
| Phase 1 scope: auth, RBAC-protected admin/citizen shells, and public
| government content (news, announcements, leadership, departments).
| Services/applications/payments/certificates are schema-only until
| Phases 2–6 wire the business logic.
*/

Route::prefix('v1')->group(function () {

    // ---- Auth --------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
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
    });

    // ---- Citizen (requires citizen role) --------------------------------
    Route::prefix('citizen')->middleware(['auth:sanctum', 'role:citizen'])->group(function () {
        Route::get('/dashboard', [CitizenDashboardController::class, 'index']);
    });

    // ---- Admin (requires staff/admin role + specific permissions) ------
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:staff'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
    });
});
