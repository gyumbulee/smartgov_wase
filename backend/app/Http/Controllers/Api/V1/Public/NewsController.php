<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Content\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $news = News::query()
            ->where('status', 'published')
            ->with(['category', 'department'])
            ->orderByDesc('published_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json($news);
    }

    public function show(string $slug)
    {
        $news = News::where('slug', $slug)->where('status', 'published')->firstOrFail();
        $news->increment('views_count');

        return response()->json($news->load(['category', 'department', 'author']));
    }
}
