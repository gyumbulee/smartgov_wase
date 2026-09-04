<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadTemplateVersionRequest;
use App\Http\Resources\CertificateTemplateVersionResource;
use App\Models\Certificates\CertificateTemplate;
use App\Models\Certificates\CertificateTemplateVersion;
use App\Models\Media\Media;
use App\Models\System\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Template versioning per spec §18: "Never overwrite an active
 * official template without maintaining history." Activating a new
 * version always archives whatever was previously active — it's never
 * silently replaced. Every generated certificate retains which
 * version it was produced from (certificates.template_version_id),
 * so archiving here never breaks a past certificate's provenance.
 */
class CertificateTemplateVersionController extends Controller
{
    public function store(UploadTemplateVersionRequest $request, CertificateTemplate $certificateTemplate)
    {
        $file = $request->file('file');
        $path = $file->store('certificate-templates/'.$certificateTemplate->id, 'local');

        $media = Media::create([
            'disk' => 'local',
            'path' => $path,
            'filename' => basename($path),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'extension' => 'pdf',
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        $nextVersionNumber = $certificateTemplate->versions()->count() + 1;

        $version = CertificateTemplateVersion::create([
            'template_id' => $certificateTemplate->id,
            'version' => $request->input('version') ?: "v{$nextVersionNumber}",
            'file_media_id' => $media->id,
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        $this->audit($request, 'certificate_template.version_uploaded', $certificateTemplate, [
            'version_id' => $version->id,
        ]);

        return new CertificateTemplateVersionResource($version);
    }

    /**
     * Activates a version — archives whatever was previously active
     * (with effective_until stamped), and marks the parent template
     * active so it becomes eligible for certificate generation.
     */
    public function activate(Request $request, CertificateTemplate $certificateTemplate, CertificateTemplateVersion $version)
    {
        abort_unless($version->template_id === $certificateTemplate->id, 404);

        if (! $version->file_media_id) {
            return response()->json(['message' => 'This version has no uploaded PDF file.'], 422);
        }

        DB::transaction(function () use ($certificateTemplate, $version) {
            $certificateTemplate->versions()
                ->where('status', 'active')
                ->update(['status' => 'archived', 'effective_until' => now()]);

            $version->update(['status' => 'active', 'effective_from' => now(), 'effective_until' => null]);

            $certificateTemplate->update(['status' => 'active']);
        });

        $this->audit($request, 'certificate_template.version_activated', $certificateTemplate, [
            'version_id' => $version->id,
        ]);

        return new CertificateTemplateVersionResource($version->fresh());
    }

    private function audit(Request $request, string $action, CertificateTemplate $template, array $extra = []): void
    {
        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'auditable_type' => CertificateTemplate::class,
            'auditable_id' => $template->id,
            'new_values' => $extra,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }
}
