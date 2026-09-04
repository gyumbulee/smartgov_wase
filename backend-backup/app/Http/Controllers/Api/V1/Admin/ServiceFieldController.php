<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceFieldRequest;
use App\Http\Resources\ServiceFieldResource;
use App\Models\Services\Service;
use App\Models\Services\ServiceField;

/**
 * Lets administrators configure the dynamic application form for a
 * service (spec §16) without a developer touching code for every new
 * certificate type.
 */
class ServiceFieldController extends Controller
{
    public function index(Service $service)
    {
        return ServiceFieldResource::collection($service->fields);
    }

    public function store(StoreServiceFieldRequest $request, Service $service)
    {
        $field = $service->fields()->create([
            ...$request->validated(),
            'is_system_field' => false,
        ]);

        return new ServiceFieldResource($field);
    }

    public function update(StoreServiceFieldRequest $request, Service $service, ServiceField $field)
    {
        if ($field->is_system_field) {
            return response()->json(['message' => 'System fields cannot be modified.'], 422);
        }

        $field->update($request->validated());

        return new ServiceFieldResource($field);
    }

    public function destroy(Service $service, ServiceField $field)
    {
        if ($field->is_system_field) {
            return response()->json(['message' => 'System fields cannot be deleted.'], 422);
        }

        $field->delete();

        return response()->json(['message' => 'Field removed.']);
    }
}
