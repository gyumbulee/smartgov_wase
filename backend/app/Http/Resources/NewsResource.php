<?php

namespace App\Http\Resources;

use App\Models\Media\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'category' => new NewsCategoryResource($this->whenLoaded('category')),
            'department' => $this->whenLoaded('department', fn () => $this->department?->name),
            'author' => $this->whenLoaded('author', fn () => $this->author?->email),
            'featured_image_url' => $this->featured_image_id ? Media::find($this->featured_image_id)?->url() : null,
            'status' => $this->status,
            'featured' => $this->featured,
            'views_count' => $this->views_count,
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
