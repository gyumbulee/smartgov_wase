<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Setting extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    // Secrets/credentials must never be stored here — use env/secret manager (spec §58).
    protected $fillable = ['key', 'value', 'type', 'group', 'is_public'];

    protected function casts(): array
    {
        return ['is_public' => 'boolean'];
    }
}

