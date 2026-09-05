<?php

namespace App\Http\Resources;

use App\Models\Media\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotablePersonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'biography' => $this->biography,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'date_of_death' => $this->date_of_death?->toDateString(),
            'category' => new NotablePeopleCategoryResource($this->whenLoaded('category')),
            'community' => $this->whenLoaded('community', fn () => $this->community?->name),
            'ward' => $this->whenLoaded('ward', fn () => $this->ward?->name),
            'photo_url' => $this->photo_media_id ? Media::find($this->photo_media_id)?->url() : null,
            'achievements' => $this->achievements,
            'contribution' => $this->contribution,
            'legacy' => $this->legacy,
            'sources' => $this->sources,
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
