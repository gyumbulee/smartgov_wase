<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'progress_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['nullable', 'string', 'max:50'],
        ];
    }
}
