<?php

namespace App\Models\Citizen;

use App\Models\Applications\Application;
use App\Models\Certificates\Certificate;
use App\Models\Complaints\Complaint;
use App\Models\Government\Community;
use App\Models\Government\Ward;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CitizenProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id', 'citizen_reference', 'first_name', 'middle_name', 'last_name',
        'date_of_birth', 'gender', 'phone', 'address', 'state_of_origin',
        'lga_of_origin', 'ward_id', 'community_id', 'identity_status', 'eligibility_status',
        'profile_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'profile_completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function identityVerifications(): HasMany
    {
        return $this->hasMany(IdentityVerification::class, 'citizen_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'citizen_id');
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'citizen_id');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'citizen_id');
    }

    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    /**
     * Identity vs eligibility are conceptually separate (spec §7).
     * This being true does NOT imply eligibility for any given service.
     */
    public function isIdentityVerified(): bool
    {
        return $this->identity_status === 'verified';
    }

    public function isEligibilityVerified(): bool
    {
        return $this->eligibility_status === 'verified';
    }
}
