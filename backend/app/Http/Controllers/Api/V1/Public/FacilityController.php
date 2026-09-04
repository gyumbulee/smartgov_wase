<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Government\Facility;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index(Request $request)
    {
        $facilities = Facility::query()
            ->where('status', 'active')
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->string('type')))
            ->when($request->filled('ward'), fn ($q) => $q->whereHas('ward', fn ($w) => $w->where('slug', $request->string('ward'))))
            ->with(['ward', 'community'])
            ->orderBy('name')
            ->get();

        return response()->json($facilities);
    }
}
