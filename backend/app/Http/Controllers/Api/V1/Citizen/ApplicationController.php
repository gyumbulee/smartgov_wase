<?php

namespace App\Http\Controllers\Api\V1\Citizen;

use App\Actions\Applications\CreateApplicationAction;
use App\Actions\Applications\SubmitApplicationAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\CreateApplicationRequest;
use App\Http\Requests\Citizen\SaveApplicationFieldsRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Applications\Application;
use App\Models\Applications\ApplicationFieldValue;
use App\Models\Services\Service;
use Illuminate\Http\Request;

/**
 * Citizen-facing application flow (spec §10): select service -> complete
 * application -> upload requirements -> submit -> payment (Phase 5) ->
 * processing -> certificate (Phase 6). Every application here belongs
 * to the authenticated citizen only — ownership is checked on every
 * action, not assumed from the URL.
 */
class ApplicationController extends Controller
{
    public function __construct(
        private readonly CreateApplicationAction $createApplication,
        private readonly SubmitApplicationAction $submitApplication,
    ) {
    }

    public function index(Request $request)
    {
        $citizen = $request->user()->citizenProfile;

        $applications = $citizen
            ? $citizen->applications()->with('service')->latest()->paginate($request->integer('per_page', 15))
            : Application::whereRaw('1=0')->paginate();

        return ApplicationResource::collection($applications);
    }

    public function store(CreateApplicationRequest $request)
    {
        $citizen = $request->user()->citizenProfile;

        if (! $citizen || ! $citizen->isIdentityVerified()) {
            return response()->json(['message' => 'Complete identity verification before applying for services.'], 403);
        }

        $service = Service::where('id', $request->input('service_id'))
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->with(['fields', 'requirements'])
            ->firstOrFail();

        // A citizen can resume an existing draft for this service rather
        // than accumulating duplicate drafts every time they revisit it.
        $existingDraft = $citizen->applications()
            ->where('service_id', $service->id)
            ->where('status', 'draft')
            ->first();

        $application = $existingDraft ?? $this->createApplication->handle($citizen, $service);

        return new ApplicationResource($application->load('service.fields', 'service.requirements', 'fieldValues', 'documents'));
    }

    public function show(Request $request, Application $application)
    {
        $this->authorizeOwnership($request, $application);

        return new ApplicationResource(
            $application->load('service.fields', 'service.requirements', 'fieldValues', 'documents', 'statusHistory')
        );
    }

    public function saveFields(SaveApplicationFieldsRequest $request, Application $application)
    {
        $this->authorizeOwnership($request, $application);

        if (! in_array($application->status, ['draft', 'correction_required'], true)) {
            return response()->json(['message' => 'This application can no longer be edited.'], 422);
        }

        $serviceFieldsByKey = $application->service->fields()->get()->keyBy('field_key');

        foreach ($request->input('values', []) as $fieldKey => $value) {
            $serviceField = $serviceFieldsByKey->get($fieldKey);
            if (! $serviceField) {
                continue; // ignore keys that don't correspond to a configured field
            }

            ApplicationFieldValue::updateOrCreate(
                ['application_id' => $application->id, 'field_key' => $fieldKey],
                ['service_field_id' => $serviceField->id, 'value_text' => is_scalar($value) ? (string) $value : null,
                    'value_json' => is_array($value) ? $value : null]
            );
        }

        return new ApplicationResource($application->fresh()->load('fieldValues'));
    }

    public function submit(Request $request, Application $application)
    {
        $this->authorizeOwnership($request, $application);

        $result = $this->submitApplication->handle($application);

        if (! $result['success']) {
            return response()->json(['message' => 'Application could not be submitted.', 'errors' => $result['errors']], 422);
        }

        return new ApplicationResource($application->fresh()->load('service.fields', 'service.requirements', 'statusHistory'));
    }

    public function cancel(Request $request, Application $application)
    {
        $this->authorizeOwnership($request, $application);

        if (! in_array($application->status, ['draft', 'submitted', 'payment_pending'], true)) {
            return response()->json(['message' => 'This application can no longer be cancelled.'], 422);
        }

        $from = $application->status;
        $application->update(['status' => 'cancelled']);

        $application->statusHistory()->create([
            'from_status' => $from,
            'to_status' => 'cancelled',
            'changed_by_user_id' => $request->user()->id,
            'reason' => 'Cancelled by citizen.',
            'created_at' => now(),
        ]);

        return new ApplicationResource($application->fresh());
    }

    private function authorizeOwnership(Request $request, Application $application): void
    {
        $citizen = $request->user()->citizenProfile;

        abort_unless($citizen && $application->citizen_id === $citizen->id, 403, 'Not your application.');
    }
}
