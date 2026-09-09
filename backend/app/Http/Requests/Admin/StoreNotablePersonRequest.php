<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * spec §40: "No fabricated biographies. All profiles should go through
 * an editorial approval process before publication." sources is
 * intentionally not required (not every entry will have a citable
 * source yet), but the field exists precisely so ones that do can
 * record it — see the 'review' status step before 'published'.
 */
class StoreNotablePersonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('person')?->id;
        return [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200', 'unique:notable_people,slug,'.$id],
            'short_description' => ['nullable', 'string', 'max:500'],
            'biography' => ['required', 'string'],
            'date_of_birth' => ['nullable', 'date'],
            'date_of_death' => ['nullable', 'date', 'after:date_of_birth'],
            'category_id' => ['nullable', 'exists:notable_people_categories,id'],
            'community_id' => ['nullable', 'exists:communities,id'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'photo_media_id' => ['nullable', 'exists:media,id'],
            'achievements' => ['nullable', 'string'],
            'contribution' => ['nullable', 'string'],
            'legacy' => ['nullable', 'string'],
            'sources' => ['nullable', 'array'],
            'status' => ['nullable', 'in:draft,review,published,archived'],
        ];
    }
}
