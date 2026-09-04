<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Projects\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('ward'), fn ($q) => $q->whereHas('ward', fn ($w) => $w->where('slug', $request->string('ward'))))
            ->with(['department', 'ward', 'community'])
            ->orderByDesc('featured')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json($projects);
    }

    public function show(string $slug)
    {
        $project = Project::where('slug', $slug)->firstOrFail();

        return response()->json($project->load(['department', 'ward', 'community', 'updates']));
    }
}
