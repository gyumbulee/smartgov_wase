<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Projects\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->with(['department', 'ward', 'community'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return ProjectResource::collection($projects);
    }

    public function store(StoreProjectRequest $request)
    {
        $project = Project::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => $request->input('status', 'proposed'),
            'currency' => $request->input('currency', 'NGN'),
        ]);

        return new ProjectResource($project->load('department', 'ward', 'community'));
    }

    public function show(Project $project)
    {
        return new ProjectResource($project->load('department', 'ward', 'community', 'updates'));
    }

    public function update(StoreProjectRequest $request, Project $project)
    {
        $project->update($request->validated());

        return new ProjectResource($project->load('department', 'ward', 'community'));
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }
}
