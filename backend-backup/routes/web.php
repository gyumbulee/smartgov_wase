<?php

use Illuminate\Support\Facades\Route;

// SmartGov-Wase is API-driven (Next.js frontend consumes /api/v1/*).
// This route exists only as a basic health/landing check for the backend service.
Route::get('/', function () {
    return response()->json([
        'service' => 'SmartGov-Wase API',
        'status' => 'ok',
    ]);
});
