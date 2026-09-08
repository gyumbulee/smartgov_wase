<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComplaintStatusRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:submitted,received,assigned,in_progress,resolved,closed,rejected'],
            'message' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:staff,id'],
        ];
    }
}
