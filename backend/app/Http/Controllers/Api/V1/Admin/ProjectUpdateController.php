<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectUpdateRequest;
use App\Http\Resources\ProjectUpdateResource;
use App\Models\Projects\Project;
use Illuminate\Http\Request;

/**
 * Progress updates for a project (spec §34/§37). Also syncs the
 * parent project's own progress_percentage/status so the public
 * project page reflects the latest update without a separate step.
 */
class ProjectUpdateController extends Controller
{
    public function store(StoreProjectUpdateRequest $request, Project $project)
    {
        $update = $project->updates()->create([
            ...$request->validated(),
            'published_at' => now(),
            'created_by' => $request->user()->id,
        ]);

        $project->update(array_filter([
            'progress_percentage' => $request->input('progress_percentage'),
        ], fn ($v) => $v !== null));

        return new ProjectUpdateResource($update);
    }

    public function destroy(Project $project, $updateId)
    {
        $project->updates()->where('id', $updateId)->delete();

        return response()->json(['message' => 'Update removed.']);
    }
}
