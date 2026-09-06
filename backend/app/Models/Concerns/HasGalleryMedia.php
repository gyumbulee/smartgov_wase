<?php

namespace App\Models\Concerns;

use App\Models\Media\Media;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Provides the polymorphic media relationship the `mediables` table
 * was designed for (spec §39/§52) — one central media system backing
 * projects, tourism, news, people, events, communities, etc., instead
 * of a separate gallery table per content type.
 *
 * `mediables.mediable_type`/`mediable_id` follow Laravel's standard
 * polymorphic naming convention for the 'mediable' morph name, so this
 * is a native morphToMany — no custom pivot model needed.
 */
trait HasGalleryMedia
{
    public function media(): MorphToMany
    {
        return $this->morphToMany(Media::class, 'mediable', 'mediables', 'mediable_id', 'media_id')
            ->withPivot(['collection', 'sort_order'])
            ->orderBy('mediables.sort_order');
    }

    public function galleryMedia(): MorphToMany
    {
        return $this->media()->wherePivot('collection', 'gallery');
    }

    public function attachGalleryMedia(string $mediaId, ?int $sortOrder = null): void
    {
        $sortOrder ??= $this->galleryMedia()->count();

        $this->media()->attach($mediaId, ['collection' => 'gallery', 'sort_order' => $sortOrder]);
    }

    public function detachGalleryMedia(string $mediaId): void
    {
        $this->media()->wherePivot('collection', 'gallery')->detach($mediaId);
    }
}
