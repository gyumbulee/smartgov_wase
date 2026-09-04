<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'auditable_type' => $this->auditable_type ? class_basename($this->auditable_type) : null,
            'auditable_id' => $this->auditable_id,
            'user' => $this->whenLoaded('user', fn () => $this->user?->email),
            'ip_address' => $this->ip_address,
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
