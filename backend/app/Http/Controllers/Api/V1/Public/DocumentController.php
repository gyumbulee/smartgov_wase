<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Content\Document;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $documents = Document::query()
            ->where('is_public', true)
            ->whereNotNull('published_at')
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->string('category_id')))
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%'.$request->string('search').'%'))
            ->with(['category', 'file'])
            ->orderByDesc('published_at')
            ->paginate($request->integer('per_page', 25));

        return DocumentResource::collection($documents);
    }
}
