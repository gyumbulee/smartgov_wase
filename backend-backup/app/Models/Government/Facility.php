<?php

namespace App\Models\Government;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Facility extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'type', 'department_id', 'ward_id', 'community_id', 'description',
        'address', 'latitude', 'longitude', 'phone', 'email', 'image_media_id', 'status',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
}

