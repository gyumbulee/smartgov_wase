<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Applications\Application;
use App\Models\Citizen\CitizenProfile;
use App\Models\Content\News;
use App\Models\Projects\Project;
use Illuminate\Http\Request;

/** Admin overview shell per spec §26 — full analytics/reporting is Phase 6/11. */
class DashboardController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'citizens' => CitizenProfile::count(),
            'applications' => Application::count(),
            'projects' => Project::count(),
            'news' => News::count(),
        ]);
    }
}
