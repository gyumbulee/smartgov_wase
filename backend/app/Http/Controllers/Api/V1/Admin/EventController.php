<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Content\Event;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index()
    {
        return EventResource::collection(Event::orderByDesc('event_date')->get());
    }

    public function store(StoreEventRequest $request)
    {
        $event = Event::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('title')).'-'.now()->timestamp,
            'status' => $request->input('status', 'draft'),
        ]);

        return new EventResource($event);
    }

    public function update(StoreEventRequest $request, Event $event)
    {
        $event->update($request->validated());

        return new EventResource($event);
    }

    public function publish(Event $event)
    {
        $event->update(['status' => 'published', 'published_at' => now()]);

        return new EventResource($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();

        return response()->json(['message' => 'Event deleted.']);
    }
}
