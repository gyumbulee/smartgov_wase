<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by 'permission:departments.manage' middleware on the route
    }

    public function rules(): array
    {
        $departmentId = $this->route('department');

        return [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200', 'unique:departments,slug,'.$departmentId],
            'short_name' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
