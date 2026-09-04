<?php

namespace App\Models\Government;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeadershipProfile extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'slug', 'position', 'department_id', 'biography', 'short_bio',
        'photo_media_id', 'email', 'phone', 'display_order', 'status',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function terms(): HasMany
    {
        return $this->hasMany(LeadershipTerm::class);
    }

    public function currentTerm()
    {
        return $this->terms()->where('is_current', true)->first();
    }
}

