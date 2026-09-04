<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequirementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'requirement_type' => $this->requirement_type,
            'is_required' => $this->is_required,
            'accepted_file_types' => $this->accepted_file_types,
            'max_file_size' => $this->max_file_size,
            'sort_order' => $this->sort_order,
        ];
    }
}
