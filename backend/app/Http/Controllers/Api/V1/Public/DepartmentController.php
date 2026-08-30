<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Government\Department;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::where('status', 'active')
            ->orderBy('sort_order')
            ->get();

        return response()->json($departments);
    }

    public function show(string $slug)
    {
        $department = Department::where('slug', $slug)->where('status', 'active')->firstOrFail();

        return response()->json($department->load('leadershipProfiles'));
    }
}
