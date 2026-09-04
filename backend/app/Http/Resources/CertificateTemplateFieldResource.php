<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateTemplateFieldResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'field_key' => $this->field_key,
            'data_source' => $this->data_source,
            'x_position' => $this->x_position,
            'y_position' => $this->y_position,
            'width' => $this->width,
            'height' => $this->height,
            'font_family' => $this->font_family,
            'font_size' => $this->font_size,
            'font_style' => $this->font_style,
            'alignment' => $this->alignment,
            'color' => $this->color,
        ];
    }
}
