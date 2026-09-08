<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'version' => $this->version,
            'file_url' => $this->whenLoaded('file', fn () => $this->file?->url()),
            'file_size' => $this->whenLoaded('file', fn () => $this->file?->size),
            'is_public' => $this->is_public,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
