<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\CitizenResource;
use App\Models\Citizen\CitizenProfile;
use Illuminate\Http\Request;

/**
 * Read-only citizen oversight (spec §26/§27) — administration monitors,
 * it doesn't edit citizen identity data (that only ever comes from
 * verified NIN data, per spec §8).
 */
class CitizenController extends Controller
{
    public function index(Request $request)
    {
        $citizens = CitizenProfile::query()
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(fn ($q2) => $q2->where('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term)
                    ->orWhere('citizen_reference', 'like', $term));
            })
            ->when($request->filled('identity_status'), fn ($q) => $q->where('identity_status', $request->string('identity_status')))
            ->with(['user', 'ward', 'community'])
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return CitizenResource::collection($citizens);
    }

    public function show(CitizenProfile $citizen)
    {
        return new CitizenResource(
            $citizen->load(['user', 'ward', 'community'])->loadCount('applications')
        );
    }
}
