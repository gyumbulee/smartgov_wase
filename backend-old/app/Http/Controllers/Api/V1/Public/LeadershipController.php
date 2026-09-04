<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Government\LeadershipProfile;

class LeadershipController extends Controller
{
    public function index()
    {
        $leaders = LeadershipProfile::where('status', 'published')
            ->with(['terms' => fn ($q) => $q->where('is_current', true)])
            ->orderBy('display_order')
            ->get();

        return response()->json($leaders);
    }

    public function show(string $slug)
    {
        $leader = LeadershipProfile::where('slug', $slug)->where('status', 'published')->firstOrFail();

        return response()->json($leader->load('terms', 'department'));
    }
}
