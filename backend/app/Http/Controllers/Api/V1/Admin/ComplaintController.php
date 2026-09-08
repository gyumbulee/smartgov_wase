<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateComplaintStatusRequest;
use App\Http\Resources\ComplaintResource;
use App\Models\Complaints\Complaint;
use Illuminate\Http\Request;

/**
 * Complaints are explicitly a real manual workflow (spec §47) — unlike
 * certificate applications, staff genuinely do work these by hand.
 * Every status change is recorded as a complaint_update, giving the
 * citizen a real timeline, not a fabricated one.
 */
class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $complaints = Complaint::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->string('category_id')))
            ->with(['citizen', 'category', 'assignedTo'])
            ->orderByDesc('submitted_at')
            ->paginate($request->integer('per_page', 25));

        return ComplaintResource::collection($complaints);
    }

    public function show(Complaint $complaint)
    {
        return new ComplaintResource($complaint->load('citizen', 'category', 'updates', 'assignedTo'));
    }

    public function updateStatus(UpdateComplaintStatusRequest $request, Complaint $complaint)
    {
        $complaint->update([
            'status' => $request->input('status'),
            'assigned_to' => $request->input('assigned_to', $complaint->assigned_to),
            'resolved_at' => in_array($request->input('status'), ['resolved', 'closed'], true) ? now() : $complaint->resolved_at,
        ]);

        $complaint->updates()->create([
            'user_id' => $request->user()->id,
            'status' => $request->input('status'),
            'message' => $request->input('message'),
        ]);

        return new ComplaintResource($complaint->fresh()->load('category', 'updates', 'assignedTo'));
    }
}
