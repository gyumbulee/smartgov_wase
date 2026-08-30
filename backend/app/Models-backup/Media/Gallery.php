<?php

namespace App\Models\Media;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Gallery extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['title', 'slug', 'description', 'category', 'featured_image_id', 'status'];

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'gallery_media')
            ->withPivot('sort_order', 'caption')
            ->orderBy('gallery_media.sort_order');
    }
}
