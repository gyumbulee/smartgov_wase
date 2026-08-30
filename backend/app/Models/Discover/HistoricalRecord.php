<?php

namespace App\Models\Discover;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\SoftDeletes;

class HistoricalRecord extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'title', 'slug', 'period_start', 'period_end', 'period_label', 'summary',
        'content', 'location', 'sources', 'featured', 'status', 'published_at',
    ];

    protected function casts(): array
    {
        return ['sources' => 'array', 'featured' => 'boolean', 'published_at' => 'datetime'];
    }
}

