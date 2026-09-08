<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComplaintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'complaint_reference' => $this->complaint_reference,
            'title' => $this->title,
            'description' => $this->description,
            'category' => new ComplaintCategoryResource($this->whenLoaded('category')),
            'department' => $this->whenLoaded('department', fn () => $this->department?->name),
            'citizen' => $this->whenLoaded('citizen', fn () => $this->citizen ? [
                'full_name' => $this->citizen->fullName(),
                'citizen_reference' => $this->citizen->citizen_reference,
            ] : null),
            'location' => $this->location,
            'priority' => $this->priority,
            'status' => $this->status,
            'assigned_to' => $this->whenLoaded('assignedTo', fn () => $this->assignedTo ? "{$this->assignedTo->first_name} {$this->assignedTo->last_name}" : null),
            'updates' => ComplaintUpdateResource::collection($this->whenLoaded('updates')),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'resolved_at' => $this->resolved_at?->toIso8601String(),
        ];
    }
}
