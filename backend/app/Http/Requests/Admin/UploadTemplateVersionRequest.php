<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadTemplateVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // The government's actual official PDF (spec §16) — imported
            // as-is via FPDI, never redesigned.
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'version' => ['nullable', 'string', 'max:50'],
        ];
    }
}
