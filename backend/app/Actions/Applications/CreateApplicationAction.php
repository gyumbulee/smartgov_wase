<?php

namespace App\Actions\Applications;

use App\Models\Applications\Application;
use App\Models\Applications\ApplicationStatusHistory;
use App\Models\Citizen\CitizenProfile;
use App\Models\Services\Service;
use Illuminate\Support\Str;

/**
 * Creates a draft application for a citizen against a service.
 *
 * Snapshots the service's current configuration (fields, requirements,
 * fee) onto the application (spec §77) so that later changes to the
 * service — a new fee, an added field, a swapped template — never
 * silently rewrite what this citizen actually applied under.
 */
class CreateApplicationAction
{
    public function handle(CitizenProfile $citizen, Service $service): Application
    {
        $snapshot = [
            'service_name' => $service->name,
            'service_code' => $service->service_code,
            'fee' => (float) $service->fee,
            'currency' => $service->currency,
            'requires_payment' => $service->requires_payment,
            'requires_identity_verification' => $service->requires_identity_verification,
            'fields' => $service->fields->map(fn ($f) => [
                'field_key' => $f->field_key,
                'label' => $f->label,
                'field_type' => $f->field_type,
                'is_required' => $f->is_required,
            ])->values(),
            'requirements' => $service->requirements->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'is_required' => $r->is_required,
            ])->values(),
        ];

        $application = Application::create([
            'application_reference' => $this->generateReference(),
            'citizen_id' => $citizen->id,
            'service_id' => $service->id,
            'status' => 'draft',
            'current_step' => 'fields',
            'configuration_snapshot' => $snapshot,
        ]);

        ApplicationStatusHistory::create([
            'application_id' => $application->id,
            'from_status' => null,
            'to_status' => 'draft',
            'changed_by_user_id' => $citizen->user_id,
            'reason' => 'Application started.',
            'created_at' => now(),
        ]);

        return $application;
    }

    private function generateReference(): string
    {
        do {
            $reference = 'SGW-'.now()->format('Y').'-'.str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (Application::where('application_reference', $reference)->exists());

        return $reference;
    }
}
