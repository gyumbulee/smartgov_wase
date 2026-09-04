<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLeadershipRequest;
use App\Http\Resources\LeadershipResource;
use App\Models\Government\LeadershipProfile;
use Illuminate\Support\Str;

class LeadershipController extends Controller
{
    public function index()
    {
        $leaders = LeadershipProfile::with(['department', 'terms'])->orderBy('display_order')->get();

        return LeadershipResource::collection($leaders);
    }

    public function store(StoreLeadershipRequest $request)
    {
        $leader = LeadershipProfile::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => $request->input('status', 'draft'),
        ]);

        return new LeadershipResource($leader);
    }

    public function show(LeadershipProfile $leader)
    {
        return new LeadershipResource($leader->load('department', 'terms'));
    }

    public function update(StoreLeadershipRequest $request, LeadershipProfile $leader)
    {
        $leader->update($request->validated());

        return new LeadershipResource($leader->load('department', 'terms'));
    }

    public function destroy(LeadershipProfile $leader)
    {
        $leader->delete();

        return response()->json(['message' => 'Leadership profile deleted.']);
    }
}
