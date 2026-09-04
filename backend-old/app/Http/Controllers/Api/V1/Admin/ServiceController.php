<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceRequest;
use App\Http\Requests\Admin\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Services\Service;
use App\Models\Services\ServiceWorkflow;
use App\Models\System\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Admin service management (spec §9, §27): administrators configure
 * services rather than developers hard-coding a module per certificate
 * type. Sensitive changes (status transitions, fee changes — handled
 * in ServiceFeeController) are audited (spec §30/§33).
 */
class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = Service::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->string('category_id')))
            ->with(['category', 'department'])
            ->orderBy('sort_order')
            ->paginate($request->integer('per_page', 20));

        return ServiceResource::collection($services);
    }

    public function store(StoreServiceRequest $request)
    {
        $service = Service::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'currency' => $request->input('currency', 'NGN'),
            'status' => 'draft',
        ]);

        // Every service gets a default automation workflow skeleton
        // (spec §68) that admins can refine later — never hand-rolled
        // per certificate type.
        ServiceWorkflow::create([
            'service_id' => $service->id,
            'name' => 'Default automated workflow',
            'version' => '1',
            'definition' => [
                'steps' => [
                    'validate_identity',
                    'validate_application',
                    'confirm_payment',
                    'queue_generation',
                    'generate_certificate',
                    'notify_citizen',
                ],
            ],
            'is_active' => true,
        ]);

        $this->audit($request, 'service.created', $service, null, $service->toArray());

        return new ServiceResource($service->load('category', 'department'));
    }

    public function show(Service $service)
    {
        return new ServiceResource($service->load('category', 'department', 'fields', 'requirements', 'feeVersions'));
    }

    public function update(UpdateServiceRequest $request, Service $service)
    {
        $original = $service->toArray();
        $service->update($request->validated());

        $this->audit($request, 'service.updated', $service, $original, $service->toArray());

        return new ServiceResource($service->load('category', 'department'));
    }

    /**
     * Publish a service — moves it from draft to active and stamps
     * published_at, making it visible on the public directory.
     */
    public function publish(Request $request, Service $service)
    {
        $original = $service->only('status', 'published_at');
        $service->update(['status' => 'active', 'published_at' => now()]);

        $this->audit($request, 'service.published', $service, $original, $service->only('status', 'published_at'));

        return new ServiceResource($service);
    }

    public function suspend(Request $request, Service $service)
    {
        $original = $service->only('status');
        $service->update(['status' => 'suspended']);

        $this->audit($request, 'service.suspended', $service, $original, $service->only('status'));

        return new ServiceResource($service);
    }

    public function destroy(Request $request, Service $service)
    {
        if ($service->applications()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a service that has applications on record. Retire it instead.',
            ], 422);
        }

        $this->audit($request, 'service.deleted', $service, $service->toArray(), null);
        $service->delete();

        return response()->json(['message' => 'Service deleted.']);
    }

    private function audit(Request $request, string $action, Service $service, ?array $old, ?array $new): void
    {
        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'auditable_type' => Service::class,
            'auditable_id' => $service->id,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }
}
