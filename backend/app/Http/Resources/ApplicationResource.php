<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Application shape returned to citizens. Never includes other
 * citizens' data, and — like the rest of the platform — never
 * fabricates a manual-review status that doesn't correspond to a real
 * process (spec §11/§13).
 */
class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_reference' => $this->application_reference,
            'status' => $this->status,
            'current_step' => $this->current_step,
            // Full service definition (including form fields and document
            // requirements), not just the id/name/slug — the citizen
            // application screen renders the form straight from this rather
            // than making a second call to the *public* services endpoint,
            // which 404s the moment a service is suspended/unpublished even
            // though the citizen's own application still needs to render.
            'service' => $this->whenLoaded('service', fn () => new ServiceResource($this->service)),
            'fee' => $this->configuration_snapshot['fee'] ?? null,
            'currency' => $this->configuration_snapshot['currency'] ?? null,
            'requires_payment' => $this->configuration_snapshot['requires_payment'] ?? null,
            'field_values' => $this->whenLoaded('fieldValues', fn () => $this->fieldValues
                ->mapWithKeys(fn ($v) => [$v->field_key => $v->value_text])
            ),
            'documents' => ApplicationDocumentResource::collection($this->whenLoaded('documents')),
            'status_history' => ApplicationStatusHistoryResource::collection($this->whenLoaded('statusHistory')),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
