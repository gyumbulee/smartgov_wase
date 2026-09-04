<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignRoleRequest;
use App\Http\Requests\Admin\CreateStaffRequest;
use App\Http\Resources\Admin\StaffUserResource;
use App\Models\Government\Staff;
use App\Models\Role;
use App\Models\System\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Staff/admin account provisioning (spec §28-29). There is no public
 * registration path for admin accounts — they only ever come from
 * here, created by another admin with 'users.manage'. Every account
 * creation and role change is audited (spec §30 examples: "user.role_changed").
 */
class StaffController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->whereHas('roles', fn ($q) => $q->where('slug', '!=', 'citizen'))
            ->with(['roles', 'staff.department'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return StaffUserResource::collection($users);
    }

    public function store(CreateStaffRequest $request)
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'email' => $request->string('email'),
                'password' => Hash::make($request->string('password')),
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $user->roles()->attach($request->input('role_ids'));

            Staff::create([
                'user_id' => $user->id,
                'department_id' => $request->input('department_id'),
                'employee_reference' => 'EMP-'.now()->format('Y').'-'.Str::upper(Str::random(6)),
                'first_name' => $request->string('first_name'),
                'last_name' => $request->string('last_name'),
                'position_title' => $request->input('position_title'),
                'status' => 'active',
            ]);

            return $user;
        });

        $this->audit($request, 'user.staff_created', $user->id);

        return new StaffUserResource($user->load('roles', 'staff.department'));
    }

    /**
     * Replaces a user's full role set with the provided list — supports
     * assigning multiple simultaneous roles (e.g. someone who is both
     * service_admin and content_admin), not just swapping one role for
     * another.
     */
    public function updateRole(AssignRoleRequest $request, User $user)
    {
        abort_if($user->isCitizen(), 422, 'Cannot assign staff roles to a citizen account through this endpoint.');

        $oldRoles = $user->roles()->pluck('slug');
        $user->roles()->sync($request->input('role_ids'));

        $this->audit($request, 'user.role_changed', $user->id, [
            'old_roles' => $oldRoles,
            'new_role_ids' => $request->input('role_ids'),
        ]);

        return new StaffUserResource($user->fresh()->load('roles', 'staff.department'));
    }

    public function suspend(Request $request, User $user)
    {
        $user->update(['status' => 'suspended']);
        $this->audit($request, 'user.suspended', $user->id);

        return new StaffUserResource($user->fresh()->load('roles', 'staff.department'));
    }

    public function reactivate(Request $request, User $user)
    {
        $user->update(['status' => 'active']);
        $this->audit($request, 'user.reactivated', $user->id);

        return new StaffUserResource($user->fresh()->load('roles', 'staff.department'));
    }

    public function roles()
    {
        return response()->json(Role::where('slug', '!=', 'citizen')->orderBy('name')->get(['id', 'name', 'slug']));
    }

    private function audit(Request $request, string $action, string $userId, array $extra = []): void
    {
        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'auditable_type' => User::class,
            'auditable_id' => $userId,
            'new_values' => $extra,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }
}
