<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceRequirementRequest;
use App\Http\Resources\ServiceRequirementResource;
use App\Models\Services\Service;
use App\Models\Services\ServiceRequirement;

class ServiceRequirementController extends Controller
{
    public function index(Service $service)
    {
        return ServiceRequirementResource::collection($service->requirements);
    }

    public function store(StoreServiceRequirementRequest $request, Service $service)
    {
        $requirement = $service->requirements()->create($request->validated());

        return new ServiceRequirementResource($requirement);
    }

    public function update(StoreServiceRequirementRequest $request, Service $service, ServiceRequirement $requirement)
    {
        $requirement->update($request->validated());

        return new ServiceRequirementResource($requirement);
    }

    public function destroy(Service $service, ServiceRequirement $requirement)
    {
        $requirement->delete();

        return response()->json(['message' => 'Requirement removed.']);
    }
}
