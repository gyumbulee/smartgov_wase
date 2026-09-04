<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateTemplateVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'version' => $this->version,
            'status' => $this->status,
            'has_file' => (bool) $this->file_media_id,
            'effective_from' => $this->effective_from?->toIso8601String(),
            'effective_until' => $this->effective_until?->toIso8601String(),
            'fields' => CertificateTemplateFieldResource::collection($this->whenLoaded('fields')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
