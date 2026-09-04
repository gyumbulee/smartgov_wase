<?php

namespace App\Http\Controllers\Api\V1\Citizen;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\UploadApplicationDocumentRequest;
use App\Http\Resources\ApplicationDocumentResource;
use App\Models\Applications\Application;
use App\Models\Applications\ApplicationDocument;
use App\Models\Media\Media;
use App\Models\Services\ServiceRequirement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Handles required-document uploads for an application (spec §10).
 * Files are stored on the private local disk — never publicly
 * accessible by path — and validated against the specific
 * requirement's configured file types/size, not just a generic limit.
 *
 * Each upload creates a Media record (the platform's central media
 * table, spec §39/§52) and application_documents.media_id references
 * that record's id — it does NOT store the raw storage path directly,
 * since that column is a ULID sized for an id reference, not a path.
 */
class ApplicationDocumentController extends Controller
{
    public function store(UploadApplicationDocumentRequest $request, Application $application)
    {
        $citizen = $request->user()->citizenProfile;
        abort_unless($citizen && $application->citizen_id === $citizen->id, 403, 'Not your application.');

        if (! in_array($application->status, ['draft', 'correction_required'], true)) {
            return response()->json(['message' => 'This application can no longer accept document uploads.'], 422);
        }

        $requirement = ServiceRequirement::where('id', $request->input('requirement_id'))
            ->where('service_id', $application->service_id)
            ->firstOrFail();

        $file = $request->file('file');

        $allowedTypes = $requirement->accepted_file_types
            ? array_map('trim', explode(',', strtolower($requirement->accepted_file_types)))
            : null;
        if ($allowedTypes && ! in_array(strtolower($file->getClientOriginalExtension()), $allowedTypes, true)) {
            return response()->json([
                'message' => "This requirement only accepts: {$requirement->accepted_file_types}.",
            ], 422);
        }

        if ($requirement->max_file_size && $file->getSize() > $requirement->max_file_size * 1024) {
            return response()->json(['message' => 'File exceeds the maximum allowed size for this requirement.'], 422);
        }

        // Replace any prior upload for the same requirement rather than
        // accumulating duplicates — delete the old file + media record.
        $application->documents()->where('requirement_id', $requirement->id)->get()->each(function ($doc) {
            $media = Media::find($doc->media_id);
            if ($media) {
                Storage::disk($media->disk)->delete($media->path);
                $media->delete();
            }
            $doc->delete();
        });

        $path = $file->store('application-documents/'.$application->id, 'local');

        $media = Media::create([
            'disk' => 'local',
            'path' => $path,
            'filename' => basename($path),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        $document = ApplicationDocument::create([
            'application_id' => $application->id,
            'requirement_id' => $requirement->id,
            'media_id' => $media->id,
            'document_type' => $requirement->requirement_type,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'status' => 'uploaded',
        ]);

        return new ApplicationDocumentResource($document);
    }

    public function destroy(Request $request, Application $application, ApplicationDocument $document)
    {
        $citizen = $request->user()->citizenProfile;
        abort_unless($citizen && $application->citizen_id === $citizen->id, 403, 'Not your application.');
        abort_unless($document->application_id === $application->id, 404);

        $media = Media::find($document->media_id);
        if ($media) {
            Storage::disk($media->disk)->delete($media->path);
            $media->delete();
        }
        $document->delete();

        return response()->json(['message' => 'Document removed.']);
    }
}
