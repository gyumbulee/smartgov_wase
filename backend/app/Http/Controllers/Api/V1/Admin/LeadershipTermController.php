<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLeadershipTermRequest;
use App\Http\Resources\LeadershipTermResource;
use App\Models\Government\LeadershipProfile;
use App\Models\Government\LeadershipTerm;
use Illuminate\Support\Facades\DB;

/**
 * Leadership history (spec §32): current + past terms are kept, not
 * overwritten. Marking a new term current automatically un-marks any
 * previous current term for the same leader — never two "current" terms.
 */
class LeadershipTermController extends Controller
{
    public function store(StoreLeadershipTermRequest $request, LeadershipProfile $leader)
    {
        $term = DB::transaction(function () use ($request, $leader) {
            if ($request->boolean('is_current')) {
                $leader->terms()->update(['is_current' => false]);
            }

            return $leader->terms()->create($request->validated());
        });

        return new LeadershipTermResource($term);
    }

    public function update(StoreLeadershipTermRequest $request, LeadershipProfile $leader, LeadershipTerm $term)
    {
        abort_unless($term->leadership_profile_id === $leader->id, 404);

        DB::transaction(function () use ($request, $leader, $term) {
            if ($request->boolean('is_current')) {
                $leader->terms()->where('id', '!=', $term->id)->update(['is_current' => false]);
            }
            $term->update($request->validated());
        });

        return new LeadershipTermResource($term->fresh());
    }

    public function destroy(LeadershipProfile $leader, LeadershipTerm $term)
    {
        abort_unless($term->leadership_profile_id === $leader->id, 404);
        $term->delete();

        return response()->json(['message' => 'Term removed.']);
    }
}
