<?php

namespace App\Http\Controllers\Api\V1\Citizen;

use App\Http\Controllers\Controller;
use App\Http\Resources\CertificateResource;
use App\Models\Certificates\Certificate;
use App\Models\Media\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Citizen certificate library (spec §22). Downloads are streamed
 * through this controller after an ownership check — the underlying
 * file path is never exposed directly to the frontend.
 */
class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $citizen = $request->user()->citizenProfile;

        $certificates = $citizen
            ? $citizen->certificates()->with('service', 'application')->latest('issue_date')->get()
            : collect();

        return CertificateResource::collection($certificates);
    }

    public function show(Request $request, Certificate $certificate)
    {
        $this->authorizeOwnership($request, $certificate);

        return new CertificateResource($certificate->load('service', 'application'));
    }

    public function download(Request $request, Certificate $certificate)
    {
        $this->authorizeOwnership($request, $certificate);

        $media = Media::findOrFail($certificate->file_media_id);

        return Storage::disk($media->disk)->download($media->path, "{$certificate->certificate_number}.pdf");
    }

    private function authorizeOwnership(Request $request, Certificate $certificate): void
    {
        $citizen = $request->user()->citizenProfile;

        abort_unless($citizen && $certificate->citizen_id === $citizen->id, 403, 'Not your certificate.');
    }
}
