<?php

namespace App\Models\Citizen;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdentityVerification extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = true;

    protected $fillable = [
        'user_id', 'citizen_id', 'provider', 'verification_type', 'provider_reference',
        'request_reference', 'nin_hash', 'encrypted_nin', 'status', 'verified_at',
        'response_code', 'response_message', 'response_metadata',
    ];

    protected $hidden = ['encrypted_nin', 'nin_hash'];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'response_metadata' => 'array',
            'encrypted_nin' => 'encrypted',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(CitizenProfile::class, 'citizen_id');
    }
}

