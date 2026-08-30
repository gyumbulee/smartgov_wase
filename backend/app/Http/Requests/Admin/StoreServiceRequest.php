<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200', 'unique:services,slug'],
            'service_code' => ['required', 'string', 'max:100', 'unique:services,service_code'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'exists:service_categories,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'eligibility_description' => ['nullable', 'string'],
            'fee' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'estimated_processing_minutes' => ['nullable', 'integer', 'min:0'],
            'requires_identity_verification' => ['boolean'],
            'requires_eligibility_verification' => ['boolean'],
            'requires_payment' => ['boolean'],
            'is_online' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
