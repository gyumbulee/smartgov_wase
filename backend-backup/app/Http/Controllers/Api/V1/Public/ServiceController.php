<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceCategoryResource;
use App\Http\Resources\ServiceResource;
use App\Models\Services\Service;
use App\Models\Services\ServiceCategory;
use Illuminate\Http\Request;

/**
 * Public services directory (spec §10). Only services that are both
 * `status = active` and published are ever visible here — draft/
 * suspended/retired services never leak onto the public site
 * regardless of what an admin has configured behind the scenes.
 */
class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = Service::query()
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category',
                fn ($c) => $c->where('slug', $request->string('category'))
            ))
            ->with('category')
            ->orderBy('sort_order')
            ->paginate($request->integer('per_page', 20));

        return ServiceResource::collection($services);
    }

    public function show(string $slug)
    {
        $service = Service::where('slug', $slug)
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->with(['category', 'department', 'fields', 'requirements'])
            ->firstOrFail();

        return new ServiceResource($service);
    }

    public function categories()
    {
        $categories = ServiceCategory::where('status', 'active')
            ->withCount(['services' => fn ($q) => $q->where('status', 'active')->whereNotNull('published_at')])
            ->orderBy('sort_order')
            ->get();

        return ServiceCategoryResource::collection($categories);
    }
}
