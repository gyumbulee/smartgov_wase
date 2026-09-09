<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $serviceId = $this->route('service')?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:200'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:200', 'unique:services,slug,'.$serviceId],
            'short_description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'category_id' => ['sometimes', 'nullable', 'exists:service_categories,id'],
            'department_id' => ['sometimes', 'nullable', 'exists:departments,id'],
            'eligibility_description' => ['sometimes', 'nullable', 'string'],
            'estimated_processing_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'requires_identity_verification' => ['sometimes', 'boolean'],
            'requires_eligibility_verification' => ['sometimes', 'boolean'],
            'requires_payment' => ['sometimes', 'boolean'],
            'is_online' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'nullable', 'integer'],
            'status' => ['sometimes', 'in:draft,active,suspended,retired'],
        ];
    }
}
