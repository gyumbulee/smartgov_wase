<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('event')?->id;
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:events,slug,'.$id],
            'description' => ['nullable', 'string'],
            'event_date' => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'venue' => ['nullable', 'string', 'max:200'],
            'address' => ['nullable', 'string'],
            'organizer' => ['nullable', 'string', 'max:200'],
            'registration_url' => ['nullable', 'url'],
            'featured_image_id' => ['nullable', 'exists:media,id'],
            'status' => ['nullable', 'in:draft,published,cancelled,completed'],
        ];
    }
}
