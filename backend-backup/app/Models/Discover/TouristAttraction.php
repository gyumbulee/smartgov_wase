<?php

namespace App\Models\Discover;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TouristAttraction extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'slug', 'category_id', 'short_description', 'description', 'history',
        'cultural_significance', 'location_description', 'latitude', 'longitude',
        'directions', 'visitor_information', 'featured', 'status',
    ];

    protected function casts(): array
    {
        return ['featured' => 'boolean'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TourismCategory::class, 'category_id');
    }
}

