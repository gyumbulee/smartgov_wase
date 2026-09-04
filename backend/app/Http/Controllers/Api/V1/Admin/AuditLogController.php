<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AuditLogResource;
use App\Models\System\AuditLog;
use Illuminate\Http\Request;

/**
 * Read-only audit trail (spec §30/§33). Every sensitive administrative
 * action logged elsewhere in the platform surfaces here — this
 * controller doesn't write audit entries itself, only reads them.
 */
class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::query()
            ->when($request->filled('action'), fn ($q) => $q->where('action', 'like', '%'.$request->string('action').'%'))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->string('user_id')))
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 50));

        return AuditLogResource::collection($logs);
    }
}
