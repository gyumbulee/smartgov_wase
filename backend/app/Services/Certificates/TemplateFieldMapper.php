<?php

namespace App\Services\Certificates;

use App\Models\Applications\Application;
use App\Models\Certificates\Certificate;

/**
 * Resolves a template field's `data_source` (e.g. "citizen.full_name",
 * "application.field:child_full_name", "certificate.number") into the
 * actual value to print on the certificate. Centralizing this means
 * adding a new supported data source never requires touching the PDF
 * rendering code itself.
 */
class TemplateFieldMapper
{
    public function resolve(string $dataSource, Application $application, Certificate $certificate): string
    {
        [$scope, $key] = array_pad(explode('.', $dataSource, 2), 2, null);

        return match ($scope) {
            'citizen' => $this->resolveCitizen($key, $application),
            'application' => $this->resolveApplication($key, $application),
            'certificate' => $this->resolveCertificate($key, $certificate),
            'service' => $this->resolveService($key, $application),
            default => '',
        };
    }

    private function resolveCitizen(?string $key, Application $application): string
    {
        $citizen = $application->citizen;

        return match ($key) {
            'full_name' => $citizen->fullName(),
            'first_name' => (string) $citizen->first_name,
            'last_name' => (string) $citizen->last_name,
            'date_of_birth' => $citizen->date_of_birth?->format('d F Y') ?? '',
            'gender' => (string) ($citizen->gender ?? ''),
            'citizen_reference' => (string) $citizen->citizen_reference,
            'ward' => (string) ($citizen->ward?->name ?? ''),
            'community' => (string) ($citizen->community?->name ?? ''),
            default => '',
        };
    }

    private function resolveApplication(?string $key, Application $application): string
    {
        if ($key && str_starts_with($key, 'field:')) {
            $fieldKey = substr($key, strlen('field:'));
            return (string) ($application->fieldValues()->where('field_key', $fieldKey)->value('value_text') ?? '');
        }

        return match ($key) {
            'reference' => $application->application_reference,
            'submitted_date' => $application->submitted_at?->format('d F Y') ?? '',
            default => '',
        };
    }

    private function resolveCertificate(?string $key, Certificate $certificate): string
    {
        return match ($key) {
            'number' => $certificate->certificate_number,
            'issue_date' => $certificate->issue_date?->format('d F Y') ?? now()->format('d F Y'),
            'verification_code' => $certificate->verification_code,
            default => '',
        };
    }

    private function resolveService(?string $key, Application $application): string
    {
        return match ($key) {
            'name' => (string) ($application->configuration_snapshot['service_name'] ?? $application->service->name),
            default => '',
        };
    }
}
