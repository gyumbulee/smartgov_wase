<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreHistoricalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('record');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:historical_records,slug,'.$id],
            'period_start' => ['nullable', 'string', 'max:50'],
            'period_end' => ['nullable', 'string', 'max:50'],
            'period_label' => ['nullable', 'string', 'max:100'],
            'summary' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:200'],
            'sources' => ['nullable', 'array'],
            'featured' => ['boolean'],
            'status' => ['nullable', 'in:draft,published,archived'],
        ];
    }
}
