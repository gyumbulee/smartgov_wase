<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('news');
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:news,slug,'.$id],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'category_id' => ['nullable', 'exists:news_categories,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'featured_image_id' => ['nullable', 'exists:media,id'],
            'featured' => ['boolean'],
            'status' => ['nullable', 'in:draft,review,approved,published,archived'],
        ];
    }
}
