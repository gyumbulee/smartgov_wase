<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCertificateTemplateFieldRequest;
use App\Http\Resources\CertificateTemplateFieldResource;
use App\Models\Certificates\CertificateTemplateField;
use App\Models\Certificates\CertificateTemplateVersion;

/**
 * Field mapping per spec §17: administrators position data fields
 * (and the verification QR) on the imported PDF page without a
 * developer touching code. Mapping only makes sense against a
 * specific version — a new version starts with no fields and admins
 * re-map it (positions rarely carry over cleanly between different
 * template files).
 */
class CertificateTemplateFieldController extends Controller
{
    public function index(CertificateTemplateVersion $version)
    {
        return CertificateTemplateFieldResource::collection($version->fields);
    }

    public function store(StoreCertificateTemplateFieldRequest $request, CertificateTemplateVersion $version)
    {
        $field = $version->fields()->create($request->validated());

        return new CertificateTemplateFieldResource($field);
    }

    public function update(StoreCertificateTemplateFieldRequest $request, CertificateTemplateVersion $version, CertificateTemplateField $field)
    {
        abort_unless($field->template_version_id === $version->id, 404);

        $field->update($request->validated());

        return new CertificateTemplateFieldResource($field);
    }

    public function destroy(CertificateTemplateVersion $version, CertificateTemplateField $field)
    {
        abort_unless($field->template_version_id === $version->id, 404);

        $field->delete();

        return response()->json(['message' => 'Field removed.']);
    }
}
