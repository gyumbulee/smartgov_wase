<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFacilityRequest;
use App\Http\Resources\FacilityResource;
use App\Models\Government\Facility;

class FacilityController extends Controller
{
    public function index()
    {
        return FacilityResource::collection(Facility::with(['department', 'ward', 'community'])->orderBy('name')->get());
    }

    public function store(StoreFacilityRequest $request)
    {
        $facility = Facility::create([...$request->validated(), 'status' => $request->input('status', 'active')]);

        return new FacilityResource($facility->load('department', 'ward', 'community'));
    }

    public function update(StoreFacilityRequest $request, Facility $facility)
    {
        $facility->update($request->validated());

        return new FacilityResource($facility->load('department', 'ward', 'community'));
    }

    public function destroy(Facility $facility)
    {
        $facility->delete();

        return response()->json(['message' => 'Facility deleted.']);
    }
}
