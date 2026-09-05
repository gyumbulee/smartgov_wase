<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotablePersonResource;
use App\Models\Discover\NotablePerson;
use App\Models\Discover\NotablePeopleCategory;
use Illuminate\Http\Request;

class NotablePeopleController extends Controller
{
    public function index(Request $request)
    {
        $people = NotablePerson::query()
            ->where('status', 'published')
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $request->string('category'))
            ))
            ->with('category')
            ->orderBy('name')
            ->get();

        return NotablePersonResource::collection($people);
    }

    public function show(string $slug)
    {
        $person = NotablePerson::where('slug', $slug)
            ->where('status', 'published')
            ->with('category', 'community', 'ward')
            ->firstOrFail();

        return new NotablePersonResource($person);
    }

    public function categories()
    {
        return response()->json(
            NotablePeopleCategory::orderBy('name')->get()
        );
    }
}
