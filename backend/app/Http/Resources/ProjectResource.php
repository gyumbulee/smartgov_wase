<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'project_code' => $this->project_code,
            'description' => $this->description,
            'department' => $this->whenLoaded('department', fn () => $this->department?->name),
            'ward' => $this->whenLoaded('ward', fn () => $this->ward?->name),
            'community' => $this->whenLoaded('community', fn () => $this->community?->name),
            'location_description' => $this->location_description,
            'contractor' => $this->contractor,
            'budget' => $this->budget !== null ? (float) $this->budget : null,
            'currency' => $this->currency,
            'start_date' => $this->start_date?->toDateString(),
            'expected_completion_date' => $this->expected_completion_date?->toDateString(),
            'actual_completion_date' => $this->actual_completion_date?->toDateString(),
            'progress_percentage' => $this->progress_percentage,
            'status' => $this->status,
            'featured' => $this->featured,
            'updates' => ProjectUpdateResource::collection($this->whenLoaded('updates')),
        ];
    }
}
