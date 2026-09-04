<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('project');
        return [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200', 'unique:projects,slug,'.$id],
            'project_code' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'community_id' => ['nullable', 'exists:communities,id'],
            'location_description' => ['nullable', 'string', 'max:255'],
            'contractor' => ['nullable', 'string', 'max:200'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'start_date' => ['nullable', 'date'],
            'expected_completion_date' => ['nullable', 'date'],
            'actual_completion_date' => ['nullable', 'date'],
            'progress_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['nullable', 'in:proposed,approved,ongoing,completed,suspended,cancelled'],
            'featured' => ['boolean'],
        ];
    }
}
