<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWardRequest;
use App\Http\Resources\WardResource;
use App\Models\Government\Ward;
use Illuminate\Support\Str;

class WardController extends Controller
{
    public function index()
    {
        return WardResource::collection(Ward::withCount('communities')->orderBy('name')->get());
    }

    public function store(StoreWardRequest $request)
    {
        $ward = Ward::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => $request->input('status', 'active'),
        ]);

        return new WardResource($ward);
    }

    public function update(StoreWardRequest $request, Ward $ward)
    {
        $ward->update($request->validated());

        return new WardResource($ward);
    }

    public function destroy(Ward $ward)
    {
        if ($ward->communities()->exists()) {
            return response()->json(['message' => 'Cannot delete a ward that still has communities.'], 422);
        }
        $ward->delete();

        return response()->json(['message' => 'Ward deleted.']);
    }
}
