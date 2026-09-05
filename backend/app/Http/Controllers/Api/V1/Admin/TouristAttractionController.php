<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTouristAttractionRequest;
use App\Http\Resources\TouristAttractionResource;
use App\Models\Discover\TouristAttraction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Tourism is the most gallery-driven content type in the platform
 * (spec §74.6) — media() / attachGalleryMedia() come from
 * HasGalleryMedia, using the central polymorphic `mediables` table
 * rather than a bespoke per-model image list.
 */
class TouristAttractionController extends Controller
{
    public function index()
    {
        $attractions = TouristAttraction::with('category')->orderByDesc('featured')->orderBy('name')->get();

        return TouristAttractionResource::collection($attractions);
    }

    public function store(StoreTouristAttractionRequest $request)
    {
        $attraction = TouristAttraction::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => $request->input('status', 'draft'),
        ]);

        return new TouristAttractionResource($attraction->load('category'));
    }

    public function show(TouristAttraction $attraction)
    {
        return new TouristAttractionResource($attraction->load('category', 'galleryMedia'));
    }

    public function update(StoreTouristAttractionRequest $request, TouristAttraction $attraction)
    {
        $attraction->update($request->validated());

        return new TouristAttractionResource($attraction->load('category', 'galleryMedia'));
    }

    public function destroy(TouristAttraction $attraction)
    {
        $attraction->delete();

        return response()->json(['message' => 'Attraction deleted.']);
    }

    public function attachMedia(Request $request, TouristAttraction $attraction)
    {
        $request->validate(['media_id' => ['required', 'exists:media,id']]);

        $attraction->attachGalleryMedia($request->input('media_id'));

        return new TouristAttractionResource($attraction->load('galleryMedia'));
    }

    public function detachMedia(TouristAttraction $attraction, string $media)
    {
        $attraction->detachGalleryMedia($media);

        return response()->json(['message' => 'Image removed from gallery.']);
    }
}