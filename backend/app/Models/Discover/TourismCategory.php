<?php

namespace App\Models\Discover;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TourismCategory extends Model
{
    use HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'slug', 'description', 'icon', 'sort_order'];

    public function attractions(): HasMany
    {
        return $this->hasMany(TouristAttraction::class, 'category_id');
    }
}

