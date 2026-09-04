<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'filename' => $this->filename,
            'alt_text' => $this->alt_text,
            'title' => $this->title,
            'credit' => $this->credit,
            'mime_type' => $this->mime_type,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
