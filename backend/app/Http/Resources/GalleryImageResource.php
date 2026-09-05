<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** A media item as attached to a gallery-bearing model, with its pivot sort order. */
class GalleryImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'alt_text' => $this->alt_text,
            'credit' => $this->credit,
            'sort_order' => $this->pivot?->sort_order,
        ];
    }
}
