<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTouristAttractionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('attraction');
        return [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200', 'unique:tourist_attractions,slug,'.$id],
            'category_id' => ['nullable', 'exists:tourism_categories,id'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'history' => ['nullable', 'string'],
            'cultural_significance' => ['nullable', 'string'],
            'location_description' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'directions' => ['nullable', 'string'],
            'visitor_information' => ['nullable', 'string'],
            'featured' => ['boolean'],
            'status' => ['nullable', 'in:draft,published,archived'],
        ];
    }
}
