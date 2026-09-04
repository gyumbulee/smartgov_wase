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
            'file' => ['required', 'file', 'max:10240'],
        ];
    }
}
