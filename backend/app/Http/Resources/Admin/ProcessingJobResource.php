<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcessingJobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_type' => $this->job_type,
            'status' => $this->status,
            'attempts' => $this->attempts,
            'error_message' => $this->error_message,
            'application' => $this->whenLoaded('application', fn () => $this->application ? [
                'id' => $this->application->id,
                'application_reference' => $this->application->application_reference,
                'service_name' => $this->application->service?->name,
                'status' => $this->application->status,
            ] : null),
            'started_at' => $this->started_at?->toIso8601String(),
            'failed_at' => $this->failed_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
        ];
    }
}
