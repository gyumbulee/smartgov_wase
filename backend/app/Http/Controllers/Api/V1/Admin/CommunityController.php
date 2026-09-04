<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCommunityRequest;
use App\Http\Resources\CommunityResource;
use App\Models\Government\Community;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    public function index()
    {
        return CommunityResource::collection(Community::with('ward')->orderBy('name')->get());
    }

    public function store(StoreCommunityRequest $request)
    {
        $community = Community::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => $request->input('status', 'active'),
        ]);

        return new CommunityResource($community->load('ward'));
    }

    public function update(StoreCommunityRequest $request, Community $community)
    {
        $community->update($request->validated());

        return new CommunityResource($community->load('ward'));
    }

    public function destroy(Community $community)
    {
        $community->delete();

        return response()->json(['message' => 'Community deleted.']);
    }
}
