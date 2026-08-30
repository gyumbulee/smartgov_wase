<?php

namespace App\Http\Requests\Citizen;

use Illuminate\Foundation\Http\FormRequest;

class SaveApplicationFieldsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Field values are dynamic per service configuration (spec §16),
            // so we validate presence loosely here and let
            // SubmitApplicationAction enforce which fields are required
            // at submission time, against the field labels actually
            // configured for this service.
            'values' => ['required', 'array'],
            'values.*' => ['nullable'],
        ];
    }
}
