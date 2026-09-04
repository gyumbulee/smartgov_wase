<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequirementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'requirement_type' => ['nullable', 'string', 'max:50'],
            'is_required' => ['boolean'],
            'accepted_file_types' => ['nullable', 'string', 'max:150'],
            'max_file_size' => ['nullable', 'integer', 'min:1'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
