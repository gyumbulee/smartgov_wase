<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDocumentCategoryRequest;
use App\Models\Content\DocumentCategory;
use Illuminate\Support\Str;

class DocumentCategoryController extends Controller
{
    public function index()
    {
        return response()->json(DocumentCategory::orderBy('name')->get());
    }

    public function store(StoreDocumentCategoryRequest $request)
    {
        $category = DocumentCategory::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
        ]);

        return response()->json($category, 201);
    }

    public function destroy(DocumentCategory $category)
    {
        if ($category->documents()->exists()) {
            return response()->json(['message' => 'Cannot delete a category with documents assigned to it.'], 422);
        }
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
