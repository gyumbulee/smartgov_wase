<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public + admin service shape. Internal-only fields (department_id
 * raw FK, timestamps for soft delete, etc.) are omitted from the
 * public surface but included generously since this resource is
 * shared — admin controllers can layer on more via ->additional() if
 * ever needed. Nothing sensitive lives on `services` regardless.
 */
class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'service_code' => $this->service_code,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'category' => new ServiceCategoryResource($this->whenLoaded('category')),
            'department' => $this->whenLoaded('department', fn () => [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ]),
            'eligibility_description' => $this->eligibility_description,
            'fee' => (float) $this->fee,
            'currency' => $this->currency,
            'estimated_processing_minutes' => $this->estimated_processing_minutes,
            'status' => $this->status,
            'is_online' => $this->is_online,
            'requires_identity_verification' => $this->requires_identity_verification,
            'requires_eligibility_verification' => $this->requires_eligibility_verification,
            'requires_payment' => $this->requires_payment,
            'fields' => ServiceFieldResource::collection($this->whenLoaded('fields')),
            'requirements' => ServiceRequirementResource::collection($this->whenLoaded('requirements')),
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
