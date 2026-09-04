<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ProcessingJobResource;
use App\Jobs\GenerateCertificateJob;
use App\Models\System\ProcessingJob;
use Illuminate\Http\Request;

/**
 * The exception queue spec §69 describes: "Automation does not mean
 * every application will always succeed... These should go to an
 * Exception Queue... This is where administrators intervene."
 *
 * Currently surfaces certificate-generation failures (e.g. a service
 * reaching processing with no active template — see
 * TemplateNotConfiguredException). Retrying re-dispatches the same job;
 * if the underlying issue (e.g. missing template) has since been
 * fixed by an admin, generation proceeds normally on retry.
 */
class ExceptionQueueController extends Controller
{
    public function index(Request $request)
    {
        $jobs = ProcessingJob::query()
            ->where('status', 'failed')
            ->when($request->filled('job_type'), fn ($q) => $q->where('job_type', $request->string('job_type')))
            ->with(['application.service'])
            ->orderByDesc('failed_at')
            ->paginate($request->integer('per_page', 25));

        return ProcessingJobResource::collection($jobs);
    }

    public function retry(ProcessingJob $job)
    {
        if ($job->status !== 'failed') {
            return response()->json(['message' => 'Only failed jobs can be retried.'], 422);
        }

        if (! $job->application_id) {
            return response()->json(['message' => 'This job has no associated application to retry.'], 422);
        }

        if ($job->job_type === 'certificate_generation') {
            GenerateCertificateJob::dispatch($job->application_id);
        } else {
            return response()->json(['message' => 'Unsupported job type for retry.'], 422);
        }

        $job->update(['status' => 'queued', 'error_message' => null]);

        return response()->json(['message' => 'Retry queued.']);
    }
}
