<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCertificateTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'code' => ['required', 'string', 'max:100', 'unique:certificate_templates,code'],
            'description' => ['nullable', 'string'],
            'service_id' => ['required', 'exists:services,id'],
            'document_type' => ['nullable', 'string', 'max:100'],
        ];
    }
}
