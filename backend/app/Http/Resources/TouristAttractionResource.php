<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TouristAttractionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => new TourismCategoryResource($this->whenLoaded('category')),
            'short_description' => $this->short_description,
            'description' => $this->description,
            'history' => $this->history,
            'cultural_significance' => $this->cultural_significance,
            'location_description' => $this->location_description,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'directions' => $this->directions,
            'visitor_information' => $this->visitor_information,
            'featured' => $this->featured,
            'status' => $this->status,
            'gallery' => GalleryImageResource::collection($this->whenLoaded('galleryMedia')),
        ];
    }
}
