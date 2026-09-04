<?php

namespace App\Actions\Applications;

use App\Jobs\GenerateCertificateJob;
use App\Models\Applications\Application;
use App\Models\Applications\ApplicationStatusHistory;

/**
 * Validates that all required fields and required documents are present,
 * then moves the application forward. Per spec §11/§13: no "officer
 * reviewing" fiction — a service that requires payment goes to
 * payment_pending (Phase 5 wires the gateway); a free service goes
 * straight to processing (Phase 6 wires actual certificate generation).
 * Nothing here pretends a human is looking at the application.
 */
class SubmitApplicationAction
{
    /**
     * @return array{success: bool, errors: array<string>}
     */
    public function handle(Application $application): array
    {
        if ($application->status !== 'draft' && $application->status !== 'correction_required') {
            return ['success' => false, 'errors' => ['This application has already been submitted.']];
        }

        $errors = $this->validateRequiredFields($application);
        $errors = [...$errors, ...$this->validateRequiredDocuments($application)];

        if (! empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        $requiresPayment = $application->configuration_snapshot['requires_payment'] ?? $application->service->requires_payment;
        $newStatus = $requiresPayment ? 'payment_pending' : 'processing';

        $from = $application->status;
        $application->update([
            'status' => $newStatus,
            'submitted_at' => now(),
            'processing_started_at' => $newStatus === 'processing' ? now() : null,
        ]);

        ApplicationStatusHistory::create([
            'application_id' => $application->id,
            'from_status' => $from,
            'to_status' => $newStatus,
            'reason' => $requiresPayment
                ? 'Application submitted. Awaiting payment.'
                : 'Application submitted. No payment required — queued for processing.',
            'created_at' => now(),
        ]);

        if ($newStatus === 'processing') {
            GenerateCertificateJob::dispatch($application->id)->afterCommit();
        }

        return ['success' => true, 'errors' => []];
    }

    private function validateRequiredFields(Application $application): array
    {
        $requiredKeys = collect($application->configuration_snapshot['fields'] ?? [])
            ->where('is_required', true)
            ->pluck('label', 'field_key');

        $provided = $application->fieldValues()->pluck('value_text', 'field_key');

        $errors = [];
        foreach ($requiredKeys as $key => $label) {
            if (blank($provided[$key] ?? null)) {
                $errors[] = "\"{$label}\" is required.";
            }
        }

        return $errors;
    }

    private function validateRequiredDocuments(Application $application): array
    {
        $requiredRequirements = collect($application->configuration_snapshot['requirements'] ?? [])
            ->where('is_required', true);

        $uploadedRequirementIds = $application->documents()
            ->whereIn('status', ['uploaded', 'accepted'])
            ->pluck('requirement_id')
            ->filter()
            ->all();

        $errors = [];
        foreach ($requiredRequirements as $requirement) {
            if (! in_array($requirement['id'], $uploadedRequirementIds, true)) {
                $errors[] = "\"{$requirement['name']}\" must be uploaded.";
            }
        }

        return $errors;
    }
}
