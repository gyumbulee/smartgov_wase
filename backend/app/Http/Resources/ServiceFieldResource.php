<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceFieldResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'field_key' => $this->field_key,
            'label' => $this->label,
            'field_type' => $this->field_type,
            'placeholder' => $this->placeholder,
            'help_text' => $this->help_text,
            'default_value' => $this->default_value,
            'options' => $this->options,
            'is_required' => $this->is_required,
            'is_readonly' => $this->is_readonly,
            'sort_order' => $this->sort_order,
        ];
    }
}
