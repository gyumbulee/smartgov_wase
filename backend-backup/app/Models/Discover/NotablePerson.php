<?php

namespace App\Models\Discover;

use App\Models\Government\Community;
use App\Models\Government\Ward;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotablePerson extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    // No fabricated biographies; all profiles require editorial approval before publish (spec §40).
    protected $fillable = [
        'name', 'slug', 'short_description', 'biography', 'date_of_birth', 'date_of_death',
        'category_id', 'community_id', 'ward_id', 'photo_media_id', 'achievements',
        'contribution', 'legacy', 'sources', 'status', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'date_of_death' => 'date',
            'sources' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(NotablePeopleCategory::class, 'category_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }
}

