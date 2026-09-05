<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNotablePeopleCategoryRequest;
use App\Http\Resources\NotablePeopleCategoryResource;
use App\Models\Discover\NotablePeopleCategory;
use Illuminate\Support\Str;

class NotablePeopleCategoryController extends Controller
{
    public function index()
    {
        return NotablePeopleCategoryResource::collection(
            NotablePeopleCategory::orderBy('name')->get()
        );
    }

    public function store(StoreNotablePeopleCategoryRequest $request)
    {
        $category = NotablePeopleCategory::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
        ]);

        return new NotablePeopleCategoryResource($category);
    }

    public function destroy(NotablePeopleCategory $category)
    {
        if ($category->people()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a category with people assigned to it.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted.',
        ]);
    }
}
