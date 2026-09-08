<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComplaintCategoryResource;
use App\Models\Complaints\ComplaintCategory;

class ComplaintCategoryController extends Controller
{
    public function index()
    {
        return ComplaintCategoryResource::collection(
            ComplaintCategory::where('status', 'active')->orderBy('name')->get()
        );
    }
}
