<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Government\Ward;

class WardController extends Controller
{
    public function index()
    {
        $wards = Ward::where('status', 'active')->withCount('communities')->orderBy('name')->get();

        return response()->json($wards);
    }

    public function show(string $slug)
    {
        $ward = Ward::where('slug', $slug)->where('status', 'active')->firstOrFail();

        return response()->json($ward->load(['communities' => fn ($q) => $q->where('status', 'active')]));
    }
}
