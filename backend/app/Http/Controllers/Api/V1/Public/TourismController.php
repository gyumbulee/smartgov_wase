<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryImageResource;
use App\Models\Discover\TourismCategory;
use App\Models\Discover\TouristAttraction;
use Illuminate\Http\Request;

class TourismController extends Controller
{
    public function index(Request $request)
    {
        $attractions = TouristAttraction::query()
            ->where('status', 'published')
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $request->string('category'))
            ))
            ->with('category')
            ->orderByDesc('featured')
            ->orderBy('name')
            ->get();

        return response()->json($attractions);
    }

    public function show(string $slug)
    {
        $attraction = TouristAttraction::where('slug', $slug)
            ->where('status', 'published')
            ->with(['category', 'galleryMedia'])
            ->firstOrFail();

        $data = $attraction->toArray();
        $data['gallery'] = GalleryImageResource::collection($attraction->galleryMedia);

        return response()->json($data);
    }

    public function categories()
    {
        $categories = TourismCategory::withCount([
            'attractions' => fn ($q) => $q->where('status', 'published'),
        ])
            ->orderBy('sort_order')
            ->get();

        return response()->json($categories);
    }
}
