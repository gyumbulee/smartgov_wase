<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('category');
        return [
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:150', 'unique:complaint_categories,slug,'.$id],
            'description' => ['nullable', 'string'],
            'department_id' => ['nullable', 'exists:departments,id'],
        ];
    }
}
