<?php

namespace App\Models\Applications;

use App\Models\Certificates\Certificate;
use App\Models\Citizen\CitizenProfile;
use App\Models\Payments\Payment;
use App\Models\Services\Service;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * Statuses per spec §13 — DRAFT..CANCELLED. Never introduce a manual
     * "under review" state unless a genuine officer-review process exists.
     */
    public const STATUSES = [
        'draft', 'submitted', 'payment_pending', 'paid', 'processing',
        'completed', 'correction_required', 'failed', 'cancelled',
    ];

    protected $fillable = [
        'application_reference', 'citizen_id', 'service_id', 'status', 'current_step',
        'submitted_at', 'paid_at', 'processing_started_at', 'completed_at', 'expires_at',
        'failure_reason', 'metadata', 'configuration_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'paid_at' => 'datetime',
            'processing_started_at' => 'datetime',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
            'metadata' => 'array',
            'configuration_snapshot' => 'array',
        ];
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(CitizenProfile::class, 'citizen_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(ApplicationFieldValue::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ApplicationStatusHistory::class)->orderBy('created_at');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class);
    }
}
