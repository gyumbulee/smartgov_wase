<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDepartmentRequest;
use App\Http\Resources\Admin\DepartmentResource;
use App\Models\Government\Department;
use Illuminate\Support\Str;

/**
 * Department management. index() is reachable by any staff role
 * (no specific permission required) since departments are low-
 * sensitivity reference data every admin area needs — most immediately
 * the department picker in staff account creation (StaffController).
 * Mutations require 'departments.manage'.
 */
class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::withCount('staff')->orderBy('sort_order')->get();

        return DepartmentResource::collection($departments);
    }

    public function store(StoreDepartmentRequest $request)
    {
        $department = Department::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => $request->input('status', 'active'),
        ]);

        return new DepartmentResource($department);
    }

    public function update(StoreDepartmentRequest $request, Department $department)
    {
        $department->update($request->validated());

        return new DepartmentResource($department);
    }

    public function destroy(Department $department)
    {
        if ($department->staff()->exists() || $department->services()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a department that still has staff or services assigned to it.',
            ], 422);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted.']);
    }
}
