<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Content\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $events = Event::query()
            ->where('status', 'published')
            ->when($request->boolean('upcoming'), fn ($q) => $q->where('event_date', '>=', now()->toDateString()))
            ->orderBy('event_date')
            ->paginate($request->integer('per_page', 20));

        return response()->json($events);
    }

    public function show(string $slug)
    {
        $event = Event::where('slug', $slug)->where('status', 'published')->firstOrFail();

        return response()->json($event);
    }
}
