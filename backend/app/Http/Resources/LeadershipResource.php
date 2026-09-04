<?php

namespace App\Http\Resources;

use App\Models\Media\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadershipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'position' => $this->position,
            'department' => $this->whenLoaded('department', fn () => $this->department?->name),
            'biography' => $this->biography,
            'short_bio' => $this->short_bio,
            'photo_url' => $this->photo_media_id ? Media::find($this->photo_media_id)?->url() : null,
            'email' => $this->email,
            'phone' => $this->phone,
            'display_order' => $this->display_order,
            'status' => $this->status,
            'terms' => LeadershipTermResource::collection($this->whenLoaded('terms')),
        ];
    }
}
