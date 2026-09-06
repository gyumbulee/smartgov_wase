<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryResource;
use App\Models\Media\Gallery;

class GalleryController extends Controller
{
    public function index()
    {
        return GalleryResource::collection(
            Gallery::where('status', 'published')->withCount('media')->orderByDesc('created_at')->get()
        );
    }

    public function show(string $slug)
    {
        $gallery = Gallery::where('slug', $slug)->where('status', 'published')->with('media')->firstOrFail();

        return new GalleryResource($gallery);
    }
}
