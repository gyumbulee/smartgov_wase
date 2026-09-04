<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SetServiceFeeRequest;
use App\Models\Services\Service;
use App\Models\Services\ServiceFeeVersion;
use App\Models\System\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Admin-driven fee management for every service (business requirement:
 * "Admin set from dashboard for all"). Fees are versioned, never
 * overwritten (spec §75) — a citizen who applied under the old fee
 * keeps that amount on their historical application/payment record.
 * Every fee change is audited (spec §33 example: "Admin changed
 * service fee").
 */
class ServiceFeeController extends Controller
{
    public function index(Service $service)
    {
        return response()->json(
            $service->feeVersions()->orderByDesc('effective_from')->get()
        );
    }

    public function store(SetServiceFeeRequest $request, Service $service)
    {
        $effectiveFrom = $request->input('effective_from') ? now()->parse($request->input('effective_from')) : now();

        $feeVersion = DB::transaction(function () use ($request, $service, $effectiveFrom) {
            // Close out the currently active fee version, if any.
            $service->feeVersions()
                ->where('status', 'active')
                ->update(['status' => 'expired', 'effective_until' => $effectiveFrom]);

            $newFee = ServiceFeeVersion::create([
                'service_id' => $service->id,
                'amount' => $request->input('amount'),
                'currency' => $request->input('currency', $service->currency ?? 'NGN'),
                'effective_from' => $effectiveFrom,
                'status' => 'active',
                'created_by' => $request->user()?->id,
            ]);

            // Keep services.fee as the fast-read current amount; the
            // service_fee_versions table remains the source of truth
            // for history.
            $service->update(['fee' => $newFee->amount, 'currency' => $newFee->currency]);

            return $newFee;
        });

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'service.fee_changed',
            'auditable_type' => Service::class,
            'auditable_id' => $service->id,
            'old_values' => ['fee' => $service->getOriginal('fee')],
            'new_values' => ['fee' => $feeVersion->amount, 'currency' => $feeVersion->currency],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json($feeVersion, 201);
    }
}
