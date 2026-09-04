<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsCategoryRequest;
use App\Http\Resources\NewsCategoryResource;
use App\Models\Content\NewsCategory;
use Illuminate\Support\Str;

class NewsCategoryController extends Controller
{
    public function index()
    {
        return NewsCategoryResource::collection(NewsCategory::orderBy('name')->get());
    }

    public function store(StoreNewsCategoryRequest $request)
    {
        $category = NewsCategory::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
        ]);

        return new NewsCategoryResource($category);
    }

    public function update(StoreNewsCategoryRequest $request, NewsCategory $newsCategory)
    {
        $newsCategory->update($request->validated());

        return new NewsCategoryResource($newsCategory);
    }

    public function destroy(NewsCategory $newsCategory)
    {
        if ($newsCategory->news()->exists()) {
            return response()->json(['message' => 'Cannot delete a category with articles assigned to it.'], 422);
        }
        $newsCategory->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
