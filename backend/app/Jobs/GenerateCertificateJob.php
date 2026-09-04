<?php

namespace App\Jobs;

use App\Models\Applications\Application;
use App\Models\System\ProcessingJob;
use App\Services\Certificates\CertificateGenerationService;
use App\Services\Certificates\TemplateNotConfiguredException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

/**
 * Certificate generation runs off the main request cycle (spec §12:
 * "certificate generation should not block the main web request";
 * spec §69: exception handling routes failures to an admin queue
 * rather than crashing silently).
 */
class GenerateCertificateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public readonly string $applicationId)
    {
    }

    public function handle(CertificateGenerationService $generationService): void
    {
        $application = Application::find($this->applicationId);
        if (! $application || $application->status !== 'processing') {
            return; // application moved on (e.g. cancelled) — nothing to do
        }

        $job = ProcessingJob::create([
            'application_id' => $application->id,
            'job_type' => 'certificate_generation',
            'status' => 'running',
            'attempts' => $this->attempts(),
            'started_at' => now(),
        ]);

        try {
            $generationService->generate($application);
            $job->update(['status' => 'completed', 'completed_at' => now()]);
        } catch (TemplateNotConfiguredException $e) {
            // Expected/recoverable — no retry storm, surface clearly to admins.
            $job->update(['status' => 'failed', 'failed_at' => now(), 'error_message' => $e->getMessage()]);
            $this->fail($e);
        } catch (Throwable $e) {
            $job->update(['status' => 'failed', 'failed_at' => now(), 'error_message' => $e->getMessage()]);
            throw $e; // let the queue's retry/backoff behavior apply
        }
    }
}
