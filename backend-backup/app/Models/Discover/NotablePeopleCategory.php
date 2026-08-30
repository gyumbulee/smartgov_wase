<?php

namespace App\Models\Discover;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotablePeopleCategory extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'slug', 'description'];

    public function people(): HasMany
    {
        return $this->hasMany(NotablePerson::class, 'category_id');
    }
}
