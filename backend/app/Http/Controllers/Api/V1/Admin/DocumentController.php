<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Content\Document;
use App\Models\Media\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Public document library (spec §45). Like Phase 8's content images,
 * these are stored on the 'public' disk — distinct from citizen
 * application documents (Phase 4's ApplicationDocumentController),
 * which stay on the private 'local' disk. Forms/reports/policies are
 * meant to be publicly downloadable; citizen-submitted documents never are.
 */
class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $documents = Document::query()
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->string('category_id')))
            ->with(['category', 'file'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return DocumentResource::collection($documents);
    }

    public function store(UploadDocumentRequest $request)
    {
        $file = $request->file('file');
        $path = $file->store('documents/'.now()->format('Y/m'), 'public');

        $media = Media::create([
            'disk' => 'public',
            'path' => $path,
            'filename' => basename($path),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        $document = Document::create([
            'title' => $request->input('title'),
            'slug' => Str::slug($request->input('title')).'-'.now()->timestamp,
            'description' => $request->input('description'),
            'category_id' => $request->input('category_id'),
            'file_media_id' => $media->id,
            'is_public' => $request->boolean('is_public', true),
            'published_at' => now(),
            'created_by' => $request->user()->id,
        ]);

        return new DocumentResource($document->load('category', 'file'));
    }

    public function destroy(Document $document)
    {
        $document->delete();

        return response()->json(['message' => 'Document deleted.']);
    }
}
