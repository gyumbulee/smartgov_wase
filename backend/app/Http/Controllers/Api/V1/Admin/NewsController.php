<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\Content\News;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * News CMS editorial pipeline (spec §51): draft -> review -> approved
 * -> published -> archived. Only 'published' articles with a
 * published_at ever appear on the public site (see Public\NewsController).
 */
class NewsController extends Controller
{
    public function index(Request $request)
    {
        $news = News::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->with(['category', 'department'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return NewsResource::collection($news);
    }

    public function store(StoreNewsRequest $request)
    {
        $news = News::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('title')),
            'author_id' => $request->user()->id,
            'status' => $request->input('status', 'draft'),
        ]);

        return new NewsResource($news->load('category', 'department'));
    }

    public function show(News $news)
    {
        return new NewsResource($news->load('category', 'department', 'author'));
    }

    public function update(StoreNewsRequest $request, News $news)
    {
        $news->update($request->validated());

        return new NewsResource($news->load('category', 'department'));
    }

    public function publish(News $news)
    {
        $news->update(['status' => 'published', 'published_at' => now()]);

        return new NewsResource($news);
    }

    public function destroy(News $news)
    {
        $news->delete();

        return response()->json(['message' => 'Article deleted.']);
    }
}
