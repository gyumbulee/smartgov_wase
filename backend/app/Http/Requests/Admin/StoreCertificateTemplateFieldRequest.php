<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCertificateTemplateFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 'qr_code' is a reserved field_key that places the
            // verification QR image instead of resolving data_source text.
            'field_key' => ['required', 'string', 'max:100'],
            'data_source' => ['required_unless:field_key,qr_code', 'nullable', 'string', 'max:150'],
            'x_position' => ['required', 'numeric'],
            'y_position' => ['required', 'numeric'],
            'width' => ['nullable', 'numeric'],
            'height' => ['nullable', 'numeric'],
            'font_family' => ['nullable', 'in:helvetica,times,courier'],
            'font_size' => ['nullable', 'integer', 'min:6', 'max:96'],
            'font_style' => ['nullable', 'in:normal,bold,italic,bold-italic'],
            'alignment' => ['nullable', 'in:left,center,right'],
            'color' => ['nullable', 'string', 'max:7'],
        ];
    }
}
