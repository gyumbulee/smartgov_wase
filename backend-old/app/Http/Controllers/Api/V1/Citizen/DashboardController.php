<?php

namespace App\Http\Controllers\Api\V1\Citizen;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/** Citizen dashboard shell per spec §9 — populated fully once Phases 2-4 land. */
class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $citizen = $request->user()->citizenProfile;

        return response()->json([
            'identity_status' => $citizen?->identity_status ?? 'unverified',
            'eligibility_status' => $citizen?->eligibility_status ?? 'unknown',
            'applications_count' => $citizen?->applications()->count() ?? 0,
            'notifications_count' => $request->user()->notifications()->whereNull('read_at')->count(),
        ]);
    }
}
