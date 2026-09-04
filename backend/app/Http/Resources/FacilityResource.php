<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FacilityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'department' => $this->whenLoaded('department', fn () => $this->department?->name),
            'ward' => $this->whenLoaded('ward', fn () => $this->ward?->name),
            'community' => $this->whenLoaded('community', fn () => $this->community?->name),
            'description' => $this->description,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'email' => $this->email,
            'status' => $this->status,
        ];
    }
}
