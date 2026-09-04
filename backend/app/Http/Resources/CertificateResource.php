<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Citizen-facing certificate shape. Deliberately excludes file paths —
 * downloads go through a controller action that streams the file, not
 * a direct path exposed here.
 */
class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'certificate_number' => $this->certificate_number,
            'certificate_type' => $this->certificate_type,
            'issue_date' => $this->issue_date?->toDateString(),
            'status' => $this->status,
            'verification_code' => $this->verification_code,
            'service' => $this->whenLoaded('service', fn () => [
                'id' => $this->service->id,
                'name' => $this->service->name,
            ]),
            'application_reference' => $this->whenLoaded('application', fn () => $this->application?->application_reference),
            'generated_at' => $this->generated_at?->toIso8601String(),
        ];
    }
}
