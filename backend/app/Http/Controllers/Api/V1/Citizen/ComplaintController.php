<?php

namespace App\Http\Controllers\Api\V1\Citizen;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\StoreComplaintRequest;
use App\Http\Resources\ComplaintResource;
use App\Models\Complaints\Complaint;
use App\Models\Complaints\ComplaintCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Citizen complaint submission (spec §47). Unlike certificate
 * applications, this is a genuine operational workflow that may
 * involve staff — there's no automated "processing" fiction here,
 * just an honest status pipeline that staff move through manually.
 */
class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $citizen = $request->user()->citizenProfile;

        $complaints = $citizen
            ? $citizen->complaints()->with('category', 'updates')->latest('submitted_at')->get()
            : collect();

        return ComplaintResource::collection($complaints);
    }

    public function store(StoreComplaintRequest $request)
    {
        $citizen = $request->user()->citizenProfile;
        abort_unless($citizen, 403, 'A citizen profile is required to submit a complaint.');

        $category = ComplaintCategory::findOrFail($request->input('category_id'));

        $complaint = Complaint::create([
            ...$request->validated(),
            'complaint_reference' => $this->generateReference(),
            'citizen_id' => $citizen->id,
            'department_id' => $category->department_id,
            'priority' => $request->input('priority', 'normal'),
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $complaint->updates()->create([
            'user_id' => $request->user()->id,
            'status' => 'submitted',
            'message' => 'Complaint submitted.',
        ]);

        return new ComplaintResource($complaint->load('category'));
    }

    public function show(Request $request, Complaint $complaint)
    {
        $this->authorizeOwnership($request, $complaint);

        return new ComplaintResource($complaint->load('category', 'updates', 'assignedTo'));
    }

    private function authorizeOwnership(Request $request, Complaint $complaint): void
    {
        $citizen = $request->user()->citizenProfile;
        abort_unless($citizen && $complaint->citizen_id === $citizen->id, 403, 'Not your complaint.');
    }

    private function generateReference(): string
    {
        do {
            $reference = 'CMP-'.now()->format('Y').'-'.Str::upper(Str::random(8));
        } while (Complaint::where('complaint_reference', $reference)->exists());

        return $reference;
    }
}
