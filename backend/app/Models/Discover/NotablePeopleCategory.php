<?php

namespace App\Models\Discover;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotablePeopleCategory extends Model
{
    use HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'slug', 'description'];

    public function people(): HasMany
    {
        return $this->hasMany(NotablePerson::class, 'category_id');
    }
}

