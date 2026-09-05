<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNotablePersonRequest;
use App\Http\Resources\NotablePersonResource;
use App\Models\Discover\NotablePerson;
use Illuminate\Support\Str;

/**
 * spec §40: profiles go through an editorial approval process before
 * publication — draft -> review -> published. publish() is the only
 * action that sets published_at, matching the News/Events pattern
 * elsewhere in the platform.
 */
class NotablePersonController extends Controller
{
    public function index()
    {
        return NotablePersonResource::collection(
            NotablePerson::with('category')->orderBy('name')->get()
        );
    }

    public function store(StoreNotablePersonRequest $request)
    {
        $person = NotablePerson::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'status' => $request->input('status', 'draft'),
        ]);

        return new NotablePersonResource($person->load('category'));
    }

    public function show(NotablePerson $person)
    {
        return new NotablePersonResource(
            $person->load('category', 'community', 'ward')
        );
    }

    public function update(
        StoreNotablePersonRequest $request,
        NotablePerson $person
    ) {
        $person->update($request->validated());

        return new NotablePersonResource($person->load('category'));
    }

    public function publish(NotablePerson $person)
    {
        $person->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return new NotablePersonResource($person);
    }

    public function destroy(NotablePerson $person)
    {
        $person->delete();

        return response()->json([
            'message' => 'Profile deleted.',
        ]);
    }
}
