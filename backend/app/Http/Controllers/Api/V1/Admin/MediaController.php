<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media\Media;
use Illuminate\Http\Request;

/**
 * Uploads images for publicly-viewable content — news featured images,
 * leadership photos, event images, and (Phase 9) tourism/notable-people
 * photos and galleries.
 *
 * Deliberately stores on the 'public' disk, distinct from the 'local'
 * disk used for citizen application documents and certificate PDFs
 * (ApplicationDocumentController, CertificateGenerationService). This
 * is a hard separation, not a convention to remember: this controller
 * has no ownership check and no reason to — anything uploaded through
 * it is meant to be publicly visible. It must never be reused for
 * anything that isn't.
 */
class MediaController extends Controller
{
    public function store(UploadMediaRequest $request)
    {
        $file = $request->file('file');
        $path = $file->store('media/'.now()->format('Y/m'), 'public');

        $dimensions = @getimagesize($file->getRealPath());

        $media = Media::create([
            'disk' => 'public',
            'path' => $path,
            'filename' => basename($path),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'size' => $file->getSize(),
            'width' => $dimensions[0] ?? null,
            'height' => $dimensions[1] ?? null,
            'alt_text' => $request->input('alt_text'),
            'title' => $request->input('title'),
            'credit' => $request->input('credit'),
            'uploaded_by' => $request->user()->id,
        ]);

        return new MediaResource($media);
    }

    public function destroy(Request $request, Media $media)
    {
        abort_if($media->disk !== 'public', 403, 'This endpoint only manages public content media.');

        \Illuminate\Support\Facades\Storage::disk('public')->delete($media->path);
        $media->delete();

        return response()->json(['message' => 'Media deleted.']);
    }
}
