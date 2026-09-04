<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'field_key' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'label' => ['required', 'string', 'max:200'],
            'field_type' => ['required', 'in:text,textarea,date,select,radio,checkbox,number,email,phone,file,address'],
            'placeholder' => ['nullable', 'string', 'max:200'],
            'help_text' => ['nullable', 'string', 'max:255'],
            'default_value' => ['nullable', 'string'],
            'options' => ['nullable', 'array'],
            'is_required' => ['boolean'],
            'is_readonly' => ['boolean'],
            'validation_rules' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
