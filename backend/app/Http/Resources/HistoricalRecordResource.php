<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoricalRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'period_start' => $this->period_start,
            'period_end' => $this->period_end,
            'period_label' => $this->period_label,
            'summary' => $this->summary,
            'content' => $this->content,
            'location' => $this->location,
            'sources' => $this->sources,
            'featured' => $this->featured,
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
