<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceCategoryRequest;
use App\Http\Resources\ServiceCategoryResource;
use App\Models\Services\ServiceCategory;
use Illuminate\Support\Str;

class ServiceCategoryController extends Controller
{
    public function index()
    {
        $categories = ServiceCategory::withCount('services')->orderBy('sort_order')->get();

        return ServiceCategoryResource::collection($categories);
    }

    public function store(StoreServiceCategoryRequest $request)
    {
        $category = ServiceCategory::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => $request->input('status', 'active'),
        ]);

        return new ServiceCategoryResource($category);
    }

    public function update(StoreServiceCategoryRequest $request, ServiceCategory $serviceCategory)
    {
        $serviceCategory->update($request->validated());

        return new ServiceCategoryResource($serviceCategory);
    }

    public function destroy(ServiceCategory $serviceCategory)
    {
        if ($serviceCategory->services()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a category that still has services assigned to it.',
            ], 422);
        }

        $serviceCategory->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
