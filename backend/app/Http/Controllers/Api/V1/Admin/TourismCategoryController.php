<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTourismCategoryRequest;
use App\Http\Resources\TourismCategoryResource;
use App\Models\Discover\TourismCategory;
use Illuminate\Support\Str;

class TourismCategoryController extends Controller
{
    public function index()
    {
        return TourismCategoryResource::collection(TourismCategory::withCount('attractions')->orderBy('sort_order')->get());
    }

    public function store(StoreTourismCategoryRequest $request)
    {
        $category = TourismCategory::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
        ]);

        return new TourismCategoryResource($category);
    }

    public function update(StoreTourismCategoryRequest $request, TourismCategory $tourismCategory)
    {
        $tourismCategory->update($request->validated());

        return new TourismCategoryResource($tourismCategory);
    }

    public function destroy(TourismCategory $tourismCategory)
    {
        if ($tourismCategory->attractions()->exists()) {
            return response()->json(['message' => 'Cannot delete a category with attractions assigned to it.'], 422);
        }
        $tourismCategory->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
