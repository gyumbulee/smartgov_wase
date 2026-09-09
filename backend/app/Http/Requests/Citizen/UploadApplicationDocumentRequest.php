<?php

namespace App\Http\Requests\Citizen;

use Illuminate\Foundation\Http\FormRequest;

class UploadApplicationDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requirement_id' => ['required', 'exists:service_requirements,id'],
            // 10MB hard ceiling regardless of what a requirement configures;
            // per-requirement max_file_size is additionally enforced in
            // the controller against the specific requirement record.
            //
            // mimes: baseline is a hard ceiling the same way — the
            // controller separately enforces a requirement's own
            // accepted_file_types (if the admin set one), but that field
            // is optional, so without this rule an admin who leaves it
            // blank would accept literally any file extension (.php,
            // .exe, .html, .svg, etc). pdf/jpg/jpeg/png covers every
            // document type actually used across seeded requirements
            // (scans and photos of IDs, letters, proofs of address) —
            // a requirement can still narrow this further, just never
            // widen it.
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
        ];
    }
}
