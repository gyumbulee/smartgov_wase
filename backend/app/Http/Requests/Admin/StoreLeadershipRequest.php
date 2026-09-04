<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadershipRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('leader');
        return [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200', 'unique:leadership_profiles,slug,'.$id],
            'position' => ['required', 'string', 'max:200'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'biography' => ['nullable', 'string'],
            'short_bio' => ['nullable', 'string', 'max:500'],
            'photo_media_id' => ['nullable', 'exists:media,id'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'display_order' => ['nullable', 'integer'],
            'status' => ['nullable', 'in:draft,published,archived'],
        ];
    }
}
