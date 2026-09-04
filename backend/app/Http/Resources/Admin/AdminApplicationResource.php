<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\ApplicationDocumentResource;
use App\Http\Resources\ApplicationStatusHistoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_reference' => $this->application_reference,
            'status' => $this->status,
            'citizen' => $this->whenLoaded('citizen', fn () => [
                'id' => $this->citizen->id,
                'full_name' => $this->citizen->fullName(),
                'citizen_reference' => $this->citizen->citizen_reference,
            ]),
            'service' => $this->whenLoaded('service', fn () => [
                'id' => $this->service->id,
                'name' => $this->service->name,
            ]),
            'fee' => $this->configuration_snapshot['fee'] ?? null,
            'currency' => $this->configuration_snapshot['currency'] ?? null,
            'status_history' => ApplicationStatusHistoryResource::collection($this->whenLoaded('statusHistory')),
            'documents' => ApplicationDocumentResource::collection($this->whenLoaded('documents')),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($p) => [
                'id' => $p->id,
                'payment_reference' => $p->payment_reference,
                'status' => $p->status,
                'amount' => (float) $p->amount,
                'currency' => $p->currency,
                'paid_at' => $p->paid_at?->toIso8601String(),
            ])),
            'certificate' => $this->whenLoaded('certificate', fn () => $this->certificate ? [
                'id' => $this->certificate->id,
                'certificate_number' => $this->certificate->certificate_number,
                'status' => $this->certificate->status,
            ] : null),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
