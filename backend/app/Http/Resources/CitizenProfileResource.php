<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public-facing citizen profile shape. NIN, encrypted_nin, nin_hash and
 * raw provider metadata are never included here (spec §8 "Never expose
 * NIN publicly", §61).
 */
class CitizenProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'citizen_reference' => $this->citizen_reference,
            'full_name' => $this->fullName(),
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender,
            'phone' => $this->phone,
            'ward' => $this->whenLoaded('ward', fn () => $this->ward?->name),
            'community' => $this->whenLoaded('community', fn () => $this->community?->name),
            'identity_status' => $this->identity_status,
            'eligibility_status' => $this->eligibility_status,
            'profile_completed_at' => $this->profile_completed_at?->toIso8601String(),
        ];
    }
}
