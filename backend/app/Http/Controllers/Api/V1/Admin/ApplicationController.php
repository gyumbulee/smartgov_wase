<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminApplicationResource;
use App\Models\Applications\Application;
use Illuminate\Http\Request;

/**
 * Admin application oversight (spec §27: "Administration is oversight"
 * — since services are automated, admins monitor rather than manually
 * approve every application).
 */
class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $applications = Application::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('service_id'), fn ($q) => $q->where('service_id', $request->string('service_id')))
            ->with(['citizen', 'service'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return AdminApplicationResource::collection($applications);
    }

    public function show(Application $application)
    {
        return new AdminApplicationResource(
            $application->load(['citizen', 'service', 'statusHistory', 'documents', 'payments', 'certificate'])
        );
    }
}
