<?php

namespace App\Models\Content;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'title', 'slug', 'description', 'event_date', 'start_time', 'end_time',
        'venue', 'address', 'latitude', 'longitude', 'organizer',
        'registration_url', 'featured_image_id', 'status', 'published_at',
    ];

    protected function casts(): array
    {
        return ['event_date' => 'date', 'published_at' => 'datetime'];
    }
}
