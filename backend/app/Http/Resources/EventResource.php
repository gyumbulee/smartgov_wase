<?php

namespace App\Http\Resources;

use App\Models\Media\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'event_date' => $this->event_date?->toDateString(),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'venue' => $this->venue,
            'address' => $this->address,
            'organizer' => $this->organizer,
            'registration_url' => $this->registration_url,
            'featured_image_url' => $this->featured_image_id ? Media::find($this->featured_image_id)?->url() : null,
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
