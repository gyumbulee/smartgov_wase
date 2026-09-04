<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Never includes raw gateway_response — that can contain card/customer
 * metadata from the provider that citizens don't need to see and
 * shouldn't be exposed over the API.
 */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_reference' => $this->payment_reference,
            'gateway' => $this->gateway,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'application' => $this->whenLoaded('application', fn () => [
                'id' => $this->application->id,
                'application_reference' => $this->application->application_reference,
                'service_name' => $this->application->service?->name,
            ]),
            'receipt' => $this->whenLoaded('receipt', fn () => $this->receipt ? [
                'receipt_number' => $this->receipt->receipt_number,
                'issued_at' => $this->receipt->issued_at?->toIso8601String(),
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
