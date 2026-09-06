<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGalleryRequest;
use App\Http\Resources\GalleryResource;
use App\Models\Media\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Standalone galleries (spec §20/§53) use their own gallery_media
 * pivot rather than the generic mediables table — a gallery IS a
 * curated ordered list of images, distinct from "images attached to
 * some other content item" (which is what mediables/HasGalleryMedia
 * covers for tourism, projects, etc.).
 */
class GalleryController extends Controller
{
    public function index()
    {
        return GalleryResource::collection(Gallery::withCount('media')->orderByDesc('created_at')->get());
    }

    public function store(StoreGalleryRequest $request)
    {
        $gallery = Gallery::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('title')),
            'status' => $request->input('status', 'draft'),
        ]);

        return new GalleryResource($gallery);
    }

    public function show(Gallery $gallery)
    {
        return new GalleryResource($gallery->load('media'));
    }

    public function update(StoreGalleryRequest $request, Gallery $gallery)
    {
        $gallery->update($request->validated());

        return new GalleryResource($gallery->load('media'));
    }

    public function destroy(Gallery $gallery)
    {
        $gallery->delete();

        return response()->json(['message' => 'Gallery deleted.']);
    }

    public function attachMedia(Request $request, Gallery $gallery)
    {
        $request->validate(['media_id' => ['required', 'exists:media,id'], 'caption' => ['nullable', 'string', 'max:255']]);

        $gallery->media()->attach($request->input('media_id'), [
            'sort_order' => $gallery->media()->count(),
            'caption' => $request->input('caption'),
        ]);

        return new GalleryResource($gallery->load('media'));
    }

    public function detachMedia(Gallery $gallery, string $media)
    {
        $gallery->media()->detach($media);

        return response()->json(['message' => 'Image removed from gallery.']);
    }
}
