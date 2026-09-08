<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreComplaintCategoryRequest;
use App\Http\Resources\ComplaintCategoryResource;
use App\Models\Complaints\ComplaintCategory;
use Illuminate\Support\Str;

class ComplaintCategoryController extends Controller
{
    public function index()
    {
        return ComplaintCategoryResource::collection(ComplaintCategory::with('department')->orderBy('name')->get());
    }

    public function store(StoreComplaintCategoryRequest $request)
    {
        $category = ComplaintCategory::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => 'active',
        ]);

        return new ComplaintCategoryResource($category);
    }

    public function destroy(ComplaintCategory $category)
    {
        if ($category->complaints()->exists()) {
            return response()->json(['message' => 'Cannot delete a category with complaints assigned to it.'], 422);
        }
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
