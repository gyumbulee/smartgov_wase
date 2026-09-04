<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCertificateTemplateRequest;
use App\Http\Resources\CertificateTemplateResource;
use App\Models\Certificates\CertificateTemplate;
use App\Models\System\AuditLog;
use Illuminate\Http\Request;

/**
 * Admin certificate template management (spec §17-18). A template
 * starts inactive — it only becomes eligible for generation once it
 * has an active version with an uploaded PDF and field mappings
 * (see CertificateTemplateVersionController).
 */
class CertificateTemplateController extends Controller
{
    public function index()
    {
        $templates = CertificateTemplate::with(['service', 'versions'])->get();

        return CertificateTemplateResource::collection($templates);
    }

    public function store(StoreCertificateTemplateRequest $request)
    {
        $template = CertificateTemplate::create([
            ...$request->validated(),
            'status' => 'inactive',
        ]);

        $this->audit($request, 'certificate_template.created', $template);

        return new CertificateTemplateResource($template->load('service'));
    }

    public function show(CertificateTemplate $certificateTemplate)
    {
        return new CertificateTemplateResource(
            $certificateTemplate->load(['service', 'versions.fields'])
        );
    }

    public function destroy(Request $request, CertificateTemplate $certificateTemplate)
    {
        $this->audit($request, 'certificate_template.deleted', $certificateTemplate);
        $certificateTemplate->delete();

        return response()->json(['message' => 'Template deleted.']);
    }

    private function audit(Request $request, string $action, CertificateTemplate $template): void
    {
        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'auditable_type' => CertificateTemplate::class,
            'auditable_id' => $template->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }
}
