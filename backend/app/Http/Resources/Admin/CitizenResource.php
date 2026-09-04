<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin-facing citizen view. Still never exposes raw NIN — identity
 * verification is summarized as a status, not the underlying data
 * (spec §8/§61 apply to admins too, not just the public API).
 */
class CitizenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'citizen_reference' => $this->citizen_reference,
            'full_name' => $this->fullName(),
            'email' => $this->whenLoaded('user', fn () => $this->user?->email),
            'phone' => $this->phone,
            'ward' => $this->whenLoaded('ward', fn () => $this->ward?->name),
            'community' => $this->whenLoaded('community', fn () => $this->community?->name),
            'identity_status' => $this->identity_status,
            'eligibility_status' => $this->eligibility_status,
            'applications_count' => $this->whenCounted('applications'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
