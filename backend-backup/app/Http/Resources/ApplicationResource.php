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
            'service' => $this->whenLoaded('service', fn () => [
                'id' => $this->service->id,
                'name' => $this->service->name,
                'slug' => $this->service->slug,
            ]),
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
