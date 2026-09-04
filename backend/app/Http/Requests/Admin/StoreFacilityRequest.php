<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacilityRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'type' => ['required', 'in:government_office,school,health_facility,market,community_facility,other'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'community_id' => ['nullable', 'exists:communities,id'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }
}
